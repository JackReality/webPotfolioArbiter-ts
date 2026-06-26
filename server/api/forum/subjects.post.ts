import { AppError } from '~/lib/AppError'
import * as ForumSubjectService from '~/services/ForumSubjectService'
import * as UserService from '~/services/UserService'
import { logError } from '~/services/LogService'

const ALLOWED_TYPES = ['question', 'share', 'request', 'bug', 'announcement']

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (!session.id || !session.communityAccess)
    throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  let userId: number | undefined = session.id
  try {
    const { type, title, content } = await readBody(event)

    if (!type || !title || !content) throw new AppError('ERR_FIELDS_REQUIRED')
    if (!ALLOWED_TYPES.includes(type)) throw new AppError('ERR_INVALID_TYPE')

    const isMod = session.role === 'admin' || session.role === 'moderator'
    if (type === 'announcement' && !isMod) throw createError({ statusCode: 403, data: { error: 'ERR_FORBIDDEN' } })

    const user = await UserService.getById(session.id)
    if (!user) throw createError({ statusCode: 404, data: { error: 'ERR_USER_NOT_FOUND' } })

    const expiresAt = isMod ? null : (user.axsCommunityExpire ?? null)
    const id = await ForumSubjectService.add(session.id, session.displayName ?? '', type, title, content, expiresAt, isMod)
    return { id }
  } catch (e: any) {
    if (e.statusCode) throw e
    if (e instanceof AppError) throw createError({ statusCode: 400, data: { error: e.code } })
    console.error('[forum/subjects POST]', e)
    if (process.env.NODE_ENV === 'production') await logError('/api/forum/subjects', e, userId)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
