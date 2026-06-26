import { AppError } from '~/lib/AppError'
import * as ForumSubjectService from '~/services/ForumSubjectService'
import * as ForumCommentService from '~/services/ForumCommentService'
import { logError } from '~/services/LogService'

const isMod = (role: string) => role === 'admin' || role === 'moderator'
const isEditable = (createdAt: Date) => Date.now() - createdAt.getTime() < 60 * 60 * 1000

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (!session.id || !session.communityAccess)
    throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  let userId: number | undefined = session.id
  try {
    const commentId = Number(getRouterParam(event, 'id'))
    const comment = await ForumCommentService.getById(commentId)
    if (!comment) throw createError({ statusCode: 404, data: { error: 'ERR_NOT_FOUND' } })

    const { action, content } = await readBody(event)
    const role = session.role ?? ''
    const isOwner = comment.userId === session.id

    if (action === 'update') {
      if (!isOwner) throw createError({ statusCode: 403, data: { error: 'ERR_FORBIDDEN' } })
      if (!isEditable(comment.createdAt)) throw new AppError('ERR_EDIT_WINDOW_EXPIRED')
      if (!content) throw new AppError('ERR_FIELDS_REQUIRED')
      await ForumCommentService.update({ id: commentId, content })
    } else if (action === 'pin' || action === 'unpin') {
      const subject = await ForumSubjectService.getById(comment.forumSubjectId)
      const isSubjectOwner = subject?.userId === session.id
      if (!isMod(role) && !isSubjectOwner) throw createError({ statusCode: 403, data: { error: 'ERR_FORBIDDEN' } })
      await ForumCommentService.setPin(commentId, action === 'pin')
    } else if (action === 'hide' || action === 'unhide') {
      if (!isMod(role)) throw createError({ statusCode: 403, data: { error: 'ERR_FORBIDDEN' } })
      await ForumCommentService.setStatusCascade(commentId, action === 'hide' ? 'hidden' : 'visible')
    } else {
      throw new AppError('ERR_INVALID_ACTION')
    }

    return { ok: true }
  } catch (e: any) {
    if (e.statusCode) throw e
    if (e instanceof AppError) throw createError({ statusCode: 400, data: { error: e.code } })
    console.error('[forum/comments/:id PATCH]', e)
    if (process.env.NODE_ENV === 'production') await logError('/api/forum/comments/[id]', e, userId)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
