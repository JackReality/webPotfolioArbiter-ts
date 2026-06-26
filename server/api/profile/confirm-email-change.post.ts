import { AppError } from '~/lib/AppError'
import * as UserService from '~/services/UserService'
import * as CodeService from '~/services/CodeService'
import { logError } from '~/services/LogService'

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (!session.id) throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  let userId: number | undefined = session.id
  try {
    const { newEmail, code } = await readBody(event)
    if (!newEmail || !code) throw new AppError('ERR_FIELDS_REQUIRED')

    CodeService.checkCode(newEmail, code)
    await UserService.changeEmail(session.id, newEmail)
    return { ok: true }
  } catch (e: any) {
    if (e.statusCode) throw e
    if (e instanceof AppError) throw createError({ statusCode: 400, data: { error: e.code } })
    console.error('[profile/confirm-email-change]', e)
    if (process.env.NODE_ENV === 'production') await logError('/api/profile/confirm-email-change', e, userId)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
