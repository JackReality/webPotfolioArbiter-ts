export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  session.destroy()
  return sendRedirect(event, '/', 303)
})
