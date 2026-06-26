import * as UserService from '~/services/UserService'
import * as EmailTemplateService from '~/services/EmailTemplateService'
import * as EmailService from '~/services/EmailService'
import * as CodeService from '~/services/CodeService'

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (!session.id || !session.email)
    throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  try {
    const user = await UserService.getById(session.id)
    if (!user) throw createError({ statusCode: 404, data: { error: 'ERR_USER_NOT_FOUND' } })

    const code = CodeService.generateCode(session.email)
    const template = await EmailTemplateService.get('recovery', user.language ?? 'fr')

    const subject = template?.subject ?? 'Votre code de modification'
    const html = template?.html
      ? template.html.replace(/\{\{\s*\.?Code\s*\}\}/g, code)
      : `<p>Votre code : <strong>${code}</strong> (valable 20 minutes).</p>`

    await EmailService.sendEmail(session.email, subject, html)
    return { ok: true }
  } catch (e: any) {
    if (e.statusCode) throw e
    console.error('[profile/send-code]', e)
    throw createError({ statusCode: 500, data: { error: 'ERR_EMAIL_SEND' } })
  }
})
