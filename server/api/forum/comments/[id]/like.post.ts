import { AppError } from '~/lib/AppError'
import * as ForumCommentService from '~/services/ForumCommentService'
import { logError } from '~/services/LogService'

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (!session.id || !session.communityAccess)
    throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  let userId: number | undefined = session.id
  try {
    const id = Number(getRouterParam(event, 'id'))
    await ForumCommentService.toggleLike(id, session.id)
    return { ok: true }
  } catch (e: any) {
    if (e.statusCode) throw e
    if (e instanceof AppError) throw createError({ statusCode: 400, data: { error: e.code } })
    console.error('[forum/comments/:id/like POST]', e)
    if (process.env.NODE_ENV === 'production') await logError('/api/forum/comments/[id]/like', e, userId)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
