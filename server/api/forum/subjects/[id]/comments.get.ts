import * as ForumCommentService from '~/services/ForumCommentService'

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (!session.id || !session.communityAccess)
    throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  try {
    const id = Number(getRouterParam(event, 'id'))
    const isMod = session.role === 'admin' || session.role === 'moderator'
    return ForumCommentService.getBySubject(id, isMod)
  } catch (e: any) {
    if (e.statusCode) throw e
    console.error('[forum/subjects/:id/comments GET]', e)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
