import { AppError } from '~/lib/AppError'
import * as EmailTemplateService from '~/services/EmailTemplateService'

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (session.role !== 'admin') throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  try {
    const id = getRouterParam(event, 'id')
    const { subject, html } = await readBody(event)
    if (!subject || !html) throw new AppError('ERR_FIELDS_REQUIRED')

    await EmailTemplateService.save(Number(id), subject, html)
    return { ok: true }
  } catch (e: any) {
    if (e.statusCode) throw e
    if (e instanceof AppError) throw createError({ statusCode: 400, data: { error: e.code } })
    console.error('[admin/email-templates/update]', e)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
