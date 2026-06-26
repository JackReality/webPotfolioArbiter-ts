interface SessionData {
  id: number
  role: string
  trainings: string[]
  communityAccess: boolean
}

const ROUTE_ROLES: [string, string[]][] = [
  ['/admin', ['admin']],
  ['/moderator', ['moderator', 'admin']],
  ['/trainings/private', ['client', 'moderator', 'admin']],
  ['/subscriber', ['subscriber', 'client', 'moderator', 'admin']],
]

export default defineNuxtRouteMiddleware(async (to) => {
  const sessionState = useState<SessionData | null | undefined>('app-session', () => undefined)

  if (sessionState.value === undefined) {
    const headers = useRequestHeaders(['cookie'])
    try {
      sessionState.value = await $fetch<SessionData | null>('/api/auth/me', { headers })
    } catch {
      sessionState.value = null
    }
  }

  const session = sessionState.value
  const path = to.path

  // Formation privée — vérifier le code dans trainings[]
  if (path.startsWith('/trainings/private/')) {
    const code = path.split('/')[3]?.toUpperCase()
    if (!code || !session?.trainings?.includes(code)) {
      if (!session?.id) return navigateTo({ path: '/login', query: { returnUrl: path } })
      return navigateTo('/access-denied')
    }
  }

  // Communauté — accès communityAccess
  if (path.startsWith('/community')) {
    if (!session?.communityAccess) {
      if (!session?.id) return navigateTo({ path: '/login', query: { returnUrl: path } })
      return navigateTo('/access-denied')
    }
  }

  // Routes protégées par rôle
  for (const [route, allowedRoles] of ROUTE_ROLES) {
    if (path.startsWith(route)) {
      if (!session?.role || !allowedRoles.includes(session.role)) {
        if (!session?.role) return navigateTo({ path: '/login', query: { returnUrl: path } })
        return navigateTo('/access-denied')
      }
      break
    }
  }
})
