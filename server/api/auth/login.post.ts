import bcrypt from 'bcrypt'
import { AppError } from '~/lib/AppError'
import * as UserService from '~/services/UserService'
import * as UserTrainingService from '~/services/UserTrainingService'
import { buildSession } from '~/services/SessionService'
import { logError } from '~/services/LogService'

export default defineEventHandler(async (event) => {
  try {
    const { email, password } = await readBody(event)

    if (!email || !password) throw new AppError('ERR_FIELDS_REQUIRED')

    const user = await UserService.getByEmail(email)
    if (!user) throw new AppError('ERR_INVALID_CREDENTIALS')

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) throw new AppError('ERR_INVALID_CREDENTIALS')

    const trainings = await UserTrainingService.getByUser(user.id)
    const trainingCodes = trainings.map((t) => t.trainingCode)

    const session = await readIronSession(event)
    Object.assign(session, buildSession(user, trainingCodes))
    await session.save()

    setCookie(event, 'language', user.language, { path: '/', maxAge: 60 * 60 * 24 * 365 })

    return { ok: true }
  } catch (e) {
    if (e instanceof AppError) throw createError({ statusCode: 400, data: { error: e.code } })
    console.error('[login]', e)
    if (process.env.NODE_ENV === 'production') await logError('/api/auth/login', e)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
