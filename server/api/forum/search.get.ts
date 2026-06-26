import * as ForumService from '~/services/ForumService'

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (!session.id || !session.communityAccess)
    throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  try {
    const { q, author, addressee, staff, from, to } = getQuery(event)

    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    const dateFrom = from ? new Date(String(from)) : threeMonthsAgo
    const dateTo = to ? new Date(String(to)) : new Date()
    dateTo.setHours(23, 59, 59, 999)

    return ForumService.search({
      query: q ? String(q) : undefined,
      dateFrom,
      dateTo,
      author: author ? String(author) : undefined,
      addressee: addressee ? String(addressee) : undefined,
      staffOnly: staff === '1',
    })
  } catch (e) {
    console.error('[forum/search GET]', e)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
