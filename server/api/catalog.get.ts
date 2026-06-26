import * as TrainingService from '~/services/TrainingService'

export default defineEventHandler(async (event) => {
  const { lang } = getQuery(event)
  return TrainingService.getVisibleByLanguage(String(lang ?? 'fr'))
})
