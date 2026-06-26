import * as EmailTemplateService from '~/services/EmailTemplateService'

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (session.role !== 'admin') throw createError({ statusCode: 403, data: { error: 'ERR_FORBIDDEN' } })
  return EmailTemplateService.getAll()
})
