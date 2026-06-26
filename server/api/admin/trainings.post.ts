import { AppError } from '~/lib/AppError'
import * as TrainingService from '~/services/TrainingService'

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (session.role !== 'admin') throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  try {
    const body = await readBody(event)
    const { title, code, language, descriptionHtml } = body

    if (!title || !code || !language || !descriptionHtml)
      throw new AppError('ERR_FIELDS_REQUIRED')

    await TrainingService.add({
      title,
      code: String(code).toUpperCase(),
      language,
      descriptionHtml,
      stripeProductId: body.stripeProductId || null,
      stripePriceId: body.stripePriceId || null,
      confirmationEmailHtml: body.confirmationEmailHtml || null,
      privatePageUrl: body.privatePageUrl || null,
      publicPageUrl: body.publicPageUrl || null,
      isFree: body.isFree ?? false,
      allowRepurchase: body.allowRepurchase ?? false,
      axsCommunityMonths: body.axsCommunityMonths ? Number(body.axsCommunityMonths) : null,
    })

    return { ok: true }
  } catch (e: any) {
    if (e.statusCode) throw e
    if (e instanceof AppError) throw createError({ statusCode: 400, data: { error: e.code } })
    console.error('[admin/trainings/add]', e)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
