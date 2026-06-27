import { AppError } from '~/lib/AppError'
import * as UserService from '~/services/UserService'
import * as CodeService from '~/services/CodeService'
import * as EmailTemplateService from '~/services/EmailTemplateService'
import { sendEmail } from '~/services/EmailService'
import { logError } from '~/services/LogService'

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (!session.id) throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  let userId: number | undefined = session.id
  try {
    const { newEmail } = await readBody(event)
    if (!newEmail?.trim()) throw new AppError('ERR_FIELDS_REQUIRED')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) throw new AppError('ERR_EMAIL_INVALID')

    if (await UserService.emailExists(newEmail)) throw new AppError('ERR_EMAIL_TAKEN')

    const code = CodeService.generateCode(newEmail)
    const template = await EmailTemplateService.get('confirm_signup', 'fr')
    const subject = template?.subject ?? 'Vérification de votre adresse email'
    const html = template
      ? template.html.replace(/\{\{\s*\.?Code\s*\}\}/g, code)
      : `<p>Votre code de vérification : <strong>${code}</strong> (valable 20 minutes).</p>`
    await sendEmail(newEmail, subject, html)

    return { ok: true }
  } catch (e: any) {
    if (e.statusCode) throw e
    if (e instanceof AppError) throw createError({ statusCode: 400, data: { error: e.code } })
    console.error('[profile/request-email-change]', e)
    if (process.env.NODE_ENV === 'production') await logError('/api/profile/request-email-change', e, userId)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
