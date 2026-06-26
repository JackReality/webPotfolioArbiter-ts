import { AppError } from '~/lib/AppError'
import * as ForumCommentService from '~/services/ForumCommentService'
import { logError } from '~/services/LogService'

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (!session.id || !session.communityAccess)
    throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  let userId: number | undefined = session.id
  try {
    const commentId = Number(getRouterParam(event, 'id'))
    const comment = await ForumCommentService.getById(commentId)
    if (!comment) throw createError({ statusCode: 404, data: { error: 'ERR_NOT_FOUND' } })

    if (comment.userId !== session.id)
      throw createError({ statusCode: 403, data: { error: 'ERR_FORBIDDEN' } })

    if (await ForumCommentService.hasReplies(commentId)) throw new AppError('ERR_HAS_REPLIES')

    await ForumCommentService.remove(commentId)
    return { ok: true }
  } catch (e: any) {
    if (e.statusCode) throw e
    if (e instanceof AppError) throw createError({ statusCode: 400, data: { error: e.code } })
    console.error('[forum/comments/:id DELETE]', e)
    if (process.env.NODE_ENV === 'production') await logError('/api/forum/comments/[id]', e, userId)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
