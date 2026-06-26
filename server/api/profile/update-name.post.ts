import { AppError } from '~/lib/AppError'
import * as UserService from '~/services/UserService'
import { logError } from '~/services/LogService'

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (!session.id) throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  let userId: number | undefined = session.id
  try {
    const { displayName } = await readBody(event)
    if (!displayName?.trim()) throw new AppError('ERR_FIELDS_REQUIRED')

    await UserService.update({ id: session.id, displayName: displayName.trim() })
    return { ok: true }
  } catch (e: any) {
    if (e.statusCode) throw e
    if (e instanceof AppError) throw createError({ statusCode: 400, data: { error: e.code } })
    console.error('[profile/update-name]', e)
    if (process.env.NODE_ENV === 'production') await logError('/api/profile/update-name', e, userId)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
