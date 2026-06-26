export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (!session.id) throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })
  return { url: process.env.RESOURCES_URL ?? '#' }
})
