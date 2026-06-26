import * as ForumCommentService from '~/services/ForumCommentService'

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (!session.id || !session.communityAccess)
    throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  try {
    const { date: dateParam } = getQuery(event)
    const date = dateParam ? new Date(String(dateParam)) : new Date()

    const [data, prev, next] = await Promise.all([
      ForumCommentService.getSince(date),
      ForumCommentService.getPrevDate(date),
      ForumCommentService.getNextDate(date),
    ])

    const toDay = (d: unknown) => (d instanceof Date ? d : new Date(String(d))).toISOString().split('T')[0]

    return {
      date: date.toISOString().split('T')[0],
      prev: prev ? toDay(prev) : null,
      next: next ? toDay(next) : null,
      subjects: data.subjects,
      comments: data.comments,
    }
  } catch (e) {
    console.error('[forum/suivi GET]', e)
    throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
  }
})
