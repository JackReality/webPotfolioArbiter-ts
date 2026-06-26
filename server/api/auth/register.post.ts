import { AppError } from '~/lib/AppError'
import * as UserService from '~/services/UserService'
import * as EmailTemplateService from '~/services/EmailTemplateService'
import { sendEmail } from '~/services/EmailService'
import { generateCode, checkCode } from '~/services/CodeService'
import { logError } from '~/services/LogService'

export default defineEventHandler(async (event) => {
  try {
    const { action, email, display_name, password, passwordConfirm, code, lang = 'fr' } = await readBody(event)

    if (action === 'send-code') {
      if (!display_name || !email || !password || !passwordConfirm) throw new AppError('ERR_FIELDS_REQUIRED')
      if (await UserService.emailExists(email)) throw new AppError('ERR_EMAIL_TAKEN')

      const otp = generateCode(email)
      const template = await EmailTemplateService.get('confirm_signup', lang)
      const subject = template?.subject ?? 'Votre code de confirmation'
      const html = template
        ? template.html.replace(/\{\{\s*\.?Code\s*\}\}/g, otp)
        : `<p>Votre code : <strong>${otp}</strong> (valable 20 minutes).</p>`
      await sendEmail(email, subject, html)
      return { ok: true }
    }

    if (action === 'verify') {
      if (!email || !code || !password || !display_name) throw new AppError('ERR_FIELDS_REQUIRED')
      checkCode(email, code)
      await UserService.add(email, password, display_name, lang)

      try {
        const template = await EmailTemplateService.get('welcome', lang)
        const subject = template?.subject ?? 'Bienvenue !'
        const html = template
          ? template.html.replace(/\{\{\s*\.?DisplayName\s*\}\}/g, display_name)
          : `<p>Bonjour <strong>${display_name}</strong>, bienvenue !</p>`
        await sendEmail(email, subject, html)
      } catch { /* non bloquant */ }

      return { ok: true }
    }

    throw new AppError('ERR_INVALID_ACTION')
  } catch (e) {
    if (e instanceof AppError) throw createError({ statusCode: 400, data: { error: e.code } })
    console.error('[register]', e)
    if (process.env.NODE_ENV === 'production') await logError('/api/auth/register', e)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
