import * as ForumSubjectService from '~/services/ForumSubjectService'
import * as ForumCommentService from '~/services/ForumCommentService'
import * as ForumService from '~/services/ForumService'
import * as UserService from '~/services/UserService'

export default defineEventHandler(async (event) => {
  const session = await readIronSession(event)
  if (!session.id || !session.communityAccess)
    throw createError({ statusCode: 401, data: { error: 'ERR_UNAUTHORIZED' } })

  await ForumService.runAutoTasks()

  const [subjects, lastDateWithPosts, user] = await Promise.all([
    ForumSubjectService.getActive(),
    ForumCommentService.getLastDateWithPosts(),
    UserService.getById(session.id),
  ])

  const toDay = (d: Date) => d.toISOString().split('T')[0]

  const initialDate = user?.forumLastReadDate
    ? toDay(user.forumLastReadDate)
    : lastDateWithPosts instanceof Date
    ? toDay(lastDateWithPosts)
    : null

  return {
    subjects: subjects.map(s => ({
      ...s,
      expiresAt: s.expiresAt?.toISOString() ?? null,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt?.toISOString() ?? null,
    })),
    initialDate,
  }
})
