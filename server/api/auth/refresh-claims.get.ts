import * as UserService from '~/services/UserService'
import * as UserTrainingService from '~/services/UserTrainingService'
import { buildSession } from '~/services/SessionService'

export default defineEventHandler(async (event) => {
  const { returnUrl = '/', lang } = getQuery(event)
  const safeReturn = String(returnUrl).startsWith('/') ? String(returnUrl) : '/'

  const session = await readIronSession(event)
  if (!session.id) return sendRedirect(event, safeReturn, 303)

  try {
    const user = await UserService.getById(session.id)
    if (!user) return sendRedirect(event, '/', 303)

    const trainings = await UserTrainingService.getByUser(user.id)
    const trainingCodes = trainings.map((t) => t.trainingCode)

    Object.assign(session, buildSession(user, trainingCodes))
    await session.save()

    if (lang && ['fr', 'en', 'es'].includes(String(lang))) {
      setCookie(event, 'language', String(lang), { path: '/', maxAge: 60 * 60 * 24 * 365 })
    }

    return sendRedirect(event, safeReturn, 303)
  } catch (e) {
    console.error('[refresh-claims]', e)
    return sendRedirect(event, '/', 303)
  }
})
