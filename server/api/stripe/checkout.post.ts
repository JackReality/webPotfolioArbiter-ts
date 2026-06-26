import { AppError } from '~/lib/AppError'
import * as TrainingService from '~/services/TrainingService'
import * as UserTrainingService from '~/services/UserTrainingService'
import * as UserService from '~/services/UserService'
import { createCheckoutSession } from '~/services/StripeService'
import { buildSession } from '~/services/SessionService'
import { logError } from '~/services/LogService'

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (!session.id) throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  let userId: number | undefined = session.id
  try {
    const { trainingId } = await readBody(event)
    if (!trainingId) throw new AppError('ERR_FIELDS_REQUIRED')

    const training = await TrainingService.getById(Number(trainingId))
    if (!training) throw new AppError('ERR_TRAINING_NOT_FOUND')

    const alreadyOwned = await UserTrainingService.hasAccess(session.id, training.code)
    if (alreadyOwned && !training.allowRepurchase) throw new AppError('ERR_ALREADY_PURCHASED')

    if (training.isFree) {
      const user = await UserService.getById(session.id)
      if (!user) throw new AppError('ERR_USER_NOT_FOUND')

      await UserTrainingService.add(session.id, training.code, null, 0, null)

      const updates: Parameters<typeof UserService.update>[0] = { id: session.id }

      if (!['admin', 'moderator'].includes(user.role)) {
        updates.role = 'client'
      }

      if (training.axsCommunityMonths) {
        const base =
          user.axsCommunityExpire && user.axsCommunityExpire > new Date()
            ? new Date(user.axsCommunityExpire)
            : new Date()
        base.setMonth(base.getMonth() + training.axsCommunityMonths)
        updates.axsCommunityExpire = base
      }

      if (Object.keys(updates).length > 1) {
        await UserService.update(updates)
      }

      const [updatedUser, allTrainings] = await Promise.all([
        UserService.getById(session.id),
        UserTrainingService.getByUser(session.id),
      ])
      Object.assign(session, buildSession(updatedUser!, allTrainings.map((t) => t.trainingCode)))
      await session.save()

      return { url: `/subscriber/stripe-success?code=${encodeURIComponent(training.code)}` }
    }

    const origin = getRequestURL(event).origin
    const url = await createCheckoutSession(
      training,
      session.id,
      `${origin}/api/stripe/callback?session_id={CHECKOUT_SESSION_ID}`,
      `${origin}/formation`
    )
    return { url }
  } catch (e: any) {
    if (e.statusCode) throw e
    if (e instanceof AppError) throw createError({ statusCode: 400, data: { error: e.code } })
    console.error('[stripe/checkout]', e)
    if (process.env.NODE_ENV === 'production') await logError('/api/stripe/checkout', e, userId)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
