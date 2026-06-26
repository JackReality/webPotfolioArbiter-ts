import { AppError } from '~/lib/AppError'
import * as UserService from '~/services/UserService'

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (session.role !== 'admin') throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  try {
    const id = getRouterParam(event, 'id')
    const { role } = await readBody(event)
    if (!role) throw new AppError('ERR_FIELDS_REQUIRED')

    await UserService.changeRole(Number(id), role)
    return { ok: true }
  } catch (e: any) {
    if (e.statusCode) throw e
    if (e instanceof AppError) throw createError({ statusCode: 400, data: { error: e.code } })
    console.error('[admin/users/role]', e)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
