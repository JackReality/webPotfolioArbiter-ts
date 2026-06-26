import { AppError } from '~/lib/AppError'
import * as UserService from '~/services/UserService'
import * as EmailTemplateService from '~/services/EmailTemplateService'
import { sendEmail } from '~/services/EmailService'
import { generateCode, checkCode } from '~/services/CodeService'
import { logError } from '~/services/LogService'

export default defineEventHandler(async (event) => {
  try {
    const { action, email, code, newPassword, confirmPassword } = await readBody(event)

    if (action === 'send-code') {
      if (!email) throw new AppError('ERR_FIELDS_REQUIRED')
      const user = await UserService.getByEmail(email)
      if (user) {
        const otp = generateCode(email)
        const lang = user.language ?? 'fr'
        const template = await EmailTemplateService.get('recovery', lang)
        const subject = template?.subject ?? 'Votre code de réinitialisation'
        const html = template
          ? template.html.replace(/\{\{\s*\.?Code\s*\}\}/g, otp)
          : `<p>Votre code : <strong>${otp}</strong> (valable 20 minutes).</p>`
        await sendEmail(email, subject, html)
      }
      return { ok: true }
    }

    if (action === 'verify') {
      if (!email || !code || !newPassword || !confirmPassword) throw new AppError('ERR_FIELDS_REQUIRED')
      if (newPassword !== confirmPassword) throw new AppError('ERR_PASSWORD_MISMATCH')
      checkCode(email, code)
      const user = await UserService.getByEmail(email)
      if (user) await UserService.changePassword(user.id, newPassword)
      return { ok: true }
    }

    throw new AppError('ERR_INVALID_ACTION')
  } catch (e) {
    if (e instanceof AppError) throw createError({ statusCode: 400, data: { error: e.code } })
    console.error('[forgot-password]', e)
    if (process.env.NODE_ENV === 'production') await logError('/api/auth/forgot-password', e)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
