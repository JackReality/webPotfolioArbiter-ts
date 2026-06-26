import * as ForumCommentService from '~/services/ForumCommentService'

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (!session.id || !session.communityAccess)
    throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  try {
    return ForumCommentService.getForMe(session.id)
  } catch (e) {
    console.error('[forum/for-me GET]', e)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
