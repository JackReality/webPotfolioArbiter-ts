const SUPPORTED = ['fr', 'en', 'es']

export default defineEventHandler(async (event) => {
  const { lang = 'fr', returnUrl = '/' } = getQuery(event)
  const safeReturn = String(returnUrl).startsWith('/') ? String(returnUrl) : '/'

  if (SUPPORTED.includes(String(lang))) {
    setCookie(event, 'language', String(lang), { path: '/', maxAge: 60 * 60 * 24 * 365 })

    const session = await readIronSession(event)
    if (session.id) {
      session.language = String(lang)
      await session.save()
    }
  }

  return sendRedirect(event, safeReturn, 303)
})
