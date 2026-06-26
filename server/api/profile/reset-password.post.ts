import { AppError } from '~/lib/AppError'
import * as UserService from '~/services/UserService'
import * as CodeService from '~/services/CodeService'
import { logError } from '~/services/LogService'

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (!session.id || !session.email)
    throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  let userId: number | undefined = session.id
  try {
    const { code, newPassword } = await readBody(event)
    if (!code || !newPassword) throw new AppError('ERR_FIELDS_REQUIRED')

    CodeService.checkCode(session.email, code)
    await UserService.changePassword(session.id, newPassword)
    return { ok: true }
  } catch (e: any) {
    if (e.statusCode) throw e
    if (e instanceof AppError) throw createError({ statusCode: 400, data: { error: e.code } })
    console.error('[profile/reset-password]', e)
    if (process.env.NODE_ENV === 'production') await logError('/api/profile/reset-password', e, userId)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
