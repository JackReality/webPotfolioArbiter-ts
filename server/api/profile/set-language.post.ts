import { AppError } from '~/lib/AppError'
import * as UserService from '~/services/UserService'
import { logError } from '~/services/LogService'

const VALID_LANGUAGES = ['fr', 'en', 'es']

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (!session.id) throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  let userId: number | undefined = session.id
  try {
    const { language } = await readBody(event)
    if (!VALID_LANGUAGES.includes(language)) throw new AppError('ERR_INVALID_LANG')

    await UserService.update({ id: session.id, language })
    return { ok: true }
  } catch (e: any) {
    if (e.statusCode) throw e
    if (e instanceof AppError) throw createError({ statusCode: 400, data: { error: e.code } })
    console.error('[profile/set-language]', e)
    if (process.env.NODE_ENV === 'production') await logError('/api/profile/set-language', e, userId)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
