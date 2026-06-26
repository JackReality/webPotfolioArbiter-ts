import * as ForumSubjectService from '~/services/ForumSubjectService'

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (!session.id || !session.communityAccess)
    throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  try {
    const id = Number(getRouterParam(event, 'id'))
    const subject = await ForumSubjectService.getByIdWithCount(id)
    if (!subject) throw createError({ statusCode: 404, data: { error: 'ERR_NOT_FOUND' } })
    return subject
  } catch (e: any) {
    if (e.statusCode) throw e
    console.error('[forum/subjects/:id GET]', e)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
