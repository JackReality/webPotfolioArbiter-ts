import { AppError } from '~/lib/AppError'
import * as ForumSubjectService from '~/services/ForumSubjectService'
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

    const isMod = session.role === 'admin' || session.role === 'moderator'
    if (subject.userId !== session.id && !isMod)
      throw createError({ statusCode: 403, data: { error: 'ERR_FORBIDDEN' } })

    await ForumSubjectService.remove(subjectId)
    return { ok: true }
  } catch (e: any) {
    if (e.statusCode) throw e
    if (e instanceof AppError) throw createError({ statusCode: 400, data: { error: e.code } })
    console.error('[forum/subjects/:id DELETE]', e)
    if (process.env.NODE_ENV === 'production') await logError('/api/forum/subjects/[id]', e, userId)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
