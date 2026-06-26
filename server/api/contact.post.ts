import { AppError } from '~/lib/AppError'
import { sendEmail } from '~/services/EmailService'
import { check, record } from '~/services/ContactGuard'
import { logError } from '~/services/LogService'

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export default defineEventHandler(async (event) => {
  const { name, email, subject, message, trap } = await readBody(event)

  if (trap) return { ok: true }

  if (!name || !email || !subject || !message)
    throw createError({ statusCode: 400, data: { error: 'ERR_FIELDS_REQUIRED' } })
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    throw createError({ statusCode: 400, data: { error: 'ERR_INVALID_EMAIL' } })

  try {
    check()
    const to = process.env.CONTACT_EMAIL ?? 'contact@realityexplorer.com'
    const emailSubject = `[Contact] ${escHtml(subject).slice(0, 150)}`
    const html = `
      <p><strong>Nom :</strong> ${escHtml(name)}</p>
      <p><strong>Email :</strong> ${escHtml(email)}</p>
      <p><strong>Sujet :</strong> ${escHtml(subject)}</p>
      <p><strong>Message :</strong></p>
      <p>${escHtml(message).replace(/\n/g, '<br/>')}</p>
    `
    await sendEmail(to, emailSubject, html, email)
    record()
    return { ok: true }
  } catch (e: any) {
    if (e.statusCode) throw e
    if (e instanceof AppError) throw createError({ statusCode: 400, data: { error: e.code } })
    console.error('[contact]', e)
    if (process.env.NODE_ENV === 'production') await logError('/api/contact', e)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
