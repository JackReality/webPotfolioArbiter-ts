import { getIronSession } from 'iron-session'
import type { H3Event } from 'h3'

export interface SessionData {
  id: number
  email: string
  displayName: string
  role: string
  language: string
  trainings: string[]
  communityAccess: boolean
}

export const sessionOptions = {
  cookieName: 'session',
  password: process.env.SESSION_SECRET ?? 'changeme-au-moins-32-caracteres-secret',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
  },
}

export function readIronSession(event: H3Event) {
  return getIronSession<SessionData>(event.node.req, event.node.res, sessionOptions)
}
