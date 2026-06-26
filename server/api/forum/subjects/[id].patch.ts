import { AppError } from '~/lib/AppError'
import * as ForumSubjectService from '~/services/ForumSubjectService'
import { logError } from '~/services/LogService'

const isMod = (role: string) => role === 'admin' || role === 'moderator'
const isEditable = (createdAt: Date) => Date.now() - createdAt.getTime() < 60 * 60 * 1000

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (!session.id || !session.communityAccess)
    throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  let userId: number | undefined = session.id
  try {
    const subjectId = Number(getRouterParam(event, 'id'))
    const subject = await ForumSubjectService.getById(subjectId)
    if (!subject) throw createError({ statusCode: 404, data: { error: 'ERR_NOT_FOUND' } })

    const { action, title, content } = await readBody(event)
    const role = session.role ?? ''
    const isOwner = subject.userId === session.id

    if (action === 'update') {
      if (!isOwner && !isMod(role)) throw createError({ statusCode: 403, data: { error: 'ERR_FORBIDDEN' } })
      if (!isMod(role) && !isEditable(subject.createdAt)) throw new AppError('ERR_EDIT_WINDOW_EXPIRED')
      if (!title || !content) throw new AppError('ERR_FIELDS_REQUIRED')
      await ForumSubjectService.update({ id: subjectId, title, content, updatedAt: new Date() })
    } else if (action === 'archive') {
      if (!isOwner && !isMod(role)) throw createError({ statusCode: 403, data: { error: 'ERR_FORBIDDEN' } })
      await ForumSubjectService.setStatus(subjectId, 'archived')
    } else if (action === 'pin' || action === 'unpin') {
      if (!isMod(role)) throw createError({ statusCode: 403, data: { error: 'ERR_FORBIDDEN' } })
      await ForumSubjectService.setPin(subjectId, action === 'pin')
    } else if (action === 'hide' || action === 'unhide') {
      if (!isMod(role)) throw createError({ statusCode: 403, data: { error: 'ERR_FORBIDDEN' } })
      await ForumSubjectService.setStatus(subjectId, action === 'hide' ? 'hidden' : 'open')
    } else if (action === 'open') {
      if (!isOwner && !isMod(role)) throw createError({ statusCode: 403, data: { error: 'ERR_FORBIDDEN' } })
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      if (!subject.updatedAt || subject.updatedAt < oneMonthAgo) throw new AppError('ERR_REACTIVATION_EXPIRED')
      await ForumSubjectService.setStatus(subjectId, 'open')
    } else {
      throw new AppError('ERR_INVALID_ACTION')
    }

    return { ok: true }
  } catch (e: any) {
    if (e.statusCode) throw e
    if (e instanceof AppError) throw createError({ statusCode: 400, data: { error: e.code } })
    console.error('[forum/subjects/:id PATCH]', e)
    if (process.env.NODE_ENV === 'production') await logError('/api/forum/subjects/[id]', e, userId)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
