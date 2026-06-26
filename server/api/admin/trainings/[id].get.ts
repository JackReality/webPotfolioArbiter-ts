import { AppError } from '~/lib/AppError'
import * as TrainingService from '~/services/TrainingService'

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (session.role !== 'admin') throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  try {
    const id = getRouterParam(event, 'id')
    const training = await TrainingService.getById(Number(id))
    if (!training) throw new AppError('ERR_TRAINING_NOT_FOUND')

    return training
  } catch (e: any) {
    if (e.statusCode) throw e
    if (e instanceof AppError) throw createError({ statusCode: 400, data: { error: e.code } })
    console.error('[admin/trainings/get]', e)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
