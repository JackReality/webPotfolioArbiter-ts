import * as TrainingService from '~/services/TrainingService'

export default defineEventHandler(async (event) => {
  const { code } = getQuery(event)
  if (!code) return null
  return TrainingService.getByCode(String(code))
})
