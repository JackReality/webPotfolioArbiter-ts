import { AppError } from '~/lib/AppError'
import * as TrainingService from '~/services/TrainingService'

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (session.role !== 'admin') throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    await TrainingService.update({
      id: Number(id),
      title: body.title,
      language: body.language,
      descriptionHtml: body.descriptionHtml,
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
    console.error('[admin/trainings/update]', e)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
