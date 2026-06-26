import * as TrainingService from '~/services/TrainingService'
import * as UserTrainingService from '~/services/UserTrainingService'

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (!session.id) throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  const [trainings, purchases] = await Promise.all([
    TrainingService.getByCodes(session.trainings ?? []),
    UserTrainingService.getByUser(session.id),
  ])

  return { trainings, purchases }
})
