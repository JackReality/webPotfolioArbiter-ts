export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (!session.id) return null
  return {
    id: session.id,
    email: session.email,
    displayName: session.displayName,
    role: session.role,
    language: session.language,
    trainings: session.trainings ?? [],
    communityAccess: session.communityAccess ?? false,
  }
})
