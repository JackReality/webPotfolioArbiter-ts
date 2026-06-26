import { AppError } from '~/lib/AppError'
import * as ForumSubjectService from '~/services/ForumSubjectService'
import * as ForumCommentService from '~/services/ForumCommentService'
import { logError } from '~/services/LogService'

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (!session.id || !session.communityAccess)
    throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  let userId: number | undefined = session.id
  try {
    const subjectId = Number(getRouterParam(event, 'id'))
    const subject = await ForumSubjectService.getById(subjectId)
    if (!subject) throw createError({ statusCode: 404, data: { error: 'ERR_NOT_FOUND' } })
    if (subject.status === 'archived') throw createError({ statusCode: 403, data: { error: 'ERR_SUBJECT_CLOSED' } })

    const { content, forumCommentId } = await readBody(event)
    if (!content) throw new AppError('ERR_FIELDS_REQUIRED')

    const isStaff = session.role === 'admin' || session.role === 'moderator'
    let parentId: number | null = null
    let addressedTo: string | null = null
    let destUserId: number | null = null

    if (forumCommentId) {
      const allComments = await ForumCommentService.getBySubject(subjectId)
      const target = allComments.find((c) => c.id === Number(forumCommentId))
      if (!target) throw createError({ statusCode: 404, data: { error: 'ERR_NOT_FOUND' } })
      parentId = target.forumCommentId ?? target.id
      addressedTo = target.displayName
      if (target.userId !== session.id) destUserId = target.userId
    } else {
      if (subject.userId !== session.id) destUserId = subject.userId
    }

    const commentId = await ForumCommentService.add(
      subjectId, parentId, session.id, session.displayName ?? '',
      addressedTo, content, destUserId, isStaff
    )
    return { id: commentId }
  } catch (e: any) {
    if (e.statusCode) throw e
    if (e instanceof AppError) throw createError({ statusCode: 400, data: { error: e.code } })
    console.error('[forum/subjects/:id/comments POST]', e)
    if (process.env.NODE_ENV === 'production') await logError('/api/forum/subjects/[id]/comments', e, userId)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
