import * as ForumSubjectService from '~/services/ForumSubjectService'

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (!session.id || !session.communityAccess)
    throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  try {
    const isMod = session.role === 'admin' || session.role === 'moderator'
    const filter = String(getQuery(event).filter ?? '')

    if (filter === 'archived') return ForumSubjectService.getArchived()
    if (filter === 'hidden') {
      if (!isMod) throw createError({ statusCode: 403, data: { error: 'ERR_FORBIDDEN' } })
      return ForumSubjectService.getHidden()
    }
    return ForumSubjectService.getActive()
  } catch (e: any) {
    if (e.statusCode) throw e
    console.error('[forum/subjects GET]', e)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
