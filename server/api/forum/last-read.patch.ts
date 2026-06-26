import { AppError } from '~/lib/AppError'
import * as UserService from '~/services/UserService'
import { logError } from '~/services/LogService'

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (!session.id || !session.communityAccess)
    throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  let userId: number | undefined = session.id
  try {
    const { date } = await readBody(event)
    if (!date) throw new AppError('ERR_FIELDS_REQUIRED')
    await UserService.update({ id: session.id, forumLastReadDate: new Date(date) })
    return { ok: true }
  } catch (e: any) {
    if (e.statusCode) throw e
    if (e instanceof AppError) throw createError({ statusCode: 400, data: { error: e.code } })
    console.error('[forum/last-read PATCH]', e)
    if (process.env.NODE_ENV === 'production') await logError('/api/forum/last-read', e, userId)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
