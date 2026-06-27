<script setup lang="ts">
const { t } = useI18n()

export interface SubjectData {
  id: number
  userId: number
  displayName: string
  type: string
  title: string
  content: string
  status: string
  isPinned: boolean
  isStaff: boolean
  expiresAt: string | null
  createdAt: string
  updatedAt: string | null
  _count: { comments: number }
}

export interface CommentData {
  id: number
  forumSubjectId: number
  forumCommentId: number | null
  userId: number
  displayName: string
  addressedTo: string | null
  destUserId: number | null
  content: string
  status: string
  isPinned: boolean
  isStaff: boolean
  likes: number[]
  createdAt: string
  updatedAt: string | null
}

const props = withDefaults(defineProps<{
  subject: SubjectData
  userId: number
  userRole: string
  displayName: string
  isMod: boolean
  lang: string
  initialExpanded?: boolean
  highlightCommentId?: number
  readOnly?: boolean
  onRefreshList?: () => void
}>(), {
  initialExpanded: false,
  readOnly: false,
})

const expanded = ref(props.initialExpanded)
const comments = ref<CommentData[] | null>(null)
const loading = ref(false)
const replyTo = ref<CommentData | null>(null)
const commentText = ref('')
const submitting = ref(false)
const error = ref('')

const isSubjectOwner = computed(() => props.subject.userId === props.userId)
const withinEditWindowSubject = ref(false)
onMounted(() => {
  withinEditWindowSubject.value = Date.now() - new Date(props.subject.createdAt).getTime() < 3_600_000
})
const canEditSubject = computed(() => !props.readOnly && isSubjectOwner.value && withinEditWindowSubject.value)
const canDeleteSubject = computed(() => !props.readOnly && (isSubjectOwner.value || props.isMod) && props.subject.status === 'open')
const isHiddenSubject = computed(() => props.subject.status === 'hidden')

const subjectContentExpanded = ref(false)
const isSubjectLong = computed(() => props.subject.content.length > 200 || props.subject.content.split('\n').length > 3)
const isEditingSubject = ref(false)
const editTitle = ref(props.subject.title)
const editContent = ref(props.subject.content)
const savingSubject = ref(false)
const confirmDeleteSubject = ref(false)

const picto = computed(() => forumTypePicto(props.subject.type))
const isArchived = computed(() => props.subject.status === 'archived')
const canReactivate = ref(false)
onMounted(() => {
  if (isArchived.value && props.subject.updatedAt) {
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    canReactivate.value = new Date(props.subject.updatedAt) > oneMonthAgo
  }
})

const level0 = computed(() => (comments.value ?? []).filter(c => c.forumCommentId === null))
const pinned = computed(() => level0.value.filter(c => c.isPinned))
const regular = computed(() => level0.value.filter(c => !c.isPinned))

function getReplies(id: number) {
  return (comments.value ?? []).filter(c => c.forumCommentId === id)
}

async function loadComments() {
  loading.value = true
  const data = await $fetch<CommentData[]>(`/api/forum/subjects/${props.subject.id}/comments`)
  comments.value = Array.isArray(data) ? data : []
  loading.value = false
}

onMounted(() => {
  if (props.initialExpanded) loadComments()
})

watch(comments, async () => {
  if (!props.highlightCommentId) return
  await nextTick()
  document.getElementById(`comment-${props.highlightCommentId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
})

async function handleExpand() {
  expanded.value = !expanded.value
  if (expanded.value && comments.value === null) await loadComments()
}

async function handleSaveSubject() {
  if (!editTitle.value.trim() || !editContent.value.trim()) return
  savingSubject.value = true
  await $fetch(`/api/forum/subjects/${props.subject.id}`, {
    method: 'PATCH',
    body: { action: 'update', title: editTitle.value.trim(), content: editContent.value.trim() },
  })
  savingSubject.value = false
  isEditingSubject.value = false
  props.onRefreshList?.()
}

async function handleDeleteSubject() {
  await $fetch(`/api/forum/subjects/${props.subject.id}`, { method: 'DELETE' })
  props.onRefreshList?.()
}

async function handleUnarchiveSubject() {
  await $fetch(`/api/forum/subjects/${props.subject.id}`, {
    method: 'PATCH',
    body: { action: 'open' },
  })
  props.onRefreshList?.()
}

async function handleToggleHideSubject() {
  await $fetch(`/api/forum/subjects/${props.subject.id}`, {
    method: 'PATCH',
    body: { action: isHiddenSubject.value ? 'unhide' : 'hide' },
  })
  props.onRefreshList?.()
}

function handleReply(comment: CommentData) {
  replyTo.value = comment
}

async function handleLike(commentId: number) {
  await $fetch(`/api/forum/comments/${commentId}/like`, { method: 'POST' })
  await loadComments()
}

async function handleSubmitComment() {
  if (!commentText.value.trim()) return
  submitting.value = true
  error.value = ''
  try {
    await $fetch(`/api/forum/subjects/${props.subject.id}/comments`, {
      method: 'POST',
      body: { content: commentText.value.trim(), forumCommentId: replyTo.value?.id ?? null },
    })
    commentText.value = ''
    replyTo.value = null
    await loadComments()
  } catch (e: any) {
    error.value = t(e.data?.error ?? 'ERR_SYSTEM')
  } finally {
    submitting.value = false
  }
}

const cardClass = computed(() => {
  if (props.subject.status === 'hidden') return 'border-red-200 opacity-75'
  if (props.subject.isStaff) return 'border-l-4 border-l-teal-400 bg-zinc-50 dark:bg-zinc-800/40'
  return ''
})
</script>

<template>
  <UCard :class="cardClass">
    <template #header>
      <div class="cursor-pointer select-none" @click="handleExpand">
        <div class="flex items-start gap-3">
          <span class="text-xl mt-0.5">{{ picto }}</span>
          <div class="flex-1 min-w-0">
            <p class="font-semibold leading-tight">{{ subject.title }}</p>
            <div class="flex flex-wrap items-center gap-2 mt-1">
              <UBadge v-if="subject.isPinned" variant="subtle">📌 {{ t('forum.pinned') }}</UBadge>
              <UBadge v-if="subject.status === 'hidden' && isMod" color="error" variant="subtle">🚫 {{ t('forum.hidden') }}</UBadge>
              <span class="text-xs text-muted-foreground">
                <span class="font-medium text-foreground">{{ subject.displayName }}</span>
                · {{ forumFormatDate(subject.createdAt, lang) }}
                <template v-if="subject.updatedAt"> · <em>{{ t('forum.modifiedOn') }} {{ forumFormatDate(subject.updatedAt, lang) }}</em></template>
                <template v-if="subject.expiresAt">
                  · <span :class="new Date(subject.expiresAt) < new Date() ? 'text-red-500' : ''">{{ t('forum.expiresOn') }} {{ forumFormatDate(subject.expiresAt, lang) }}</span>
                </template>
                · {{ subject._count.comments }} {{ t(subject._count.comments === 1 ? 'forum.comment' : 'forum.comments') }}
              </span>
              <div class="flex gap-2 items-center" @click.stop>
                <button v-if="canEditSubject && !isEditingSubject" class="text-xs text-muted-foreground hover:text-foreground transition-colors" @click="isEditingSubject = true; expanded = true">✏️</button>
                <template v-if="canDeleteSubject">
                  <template v-if="confirmDeleteSubject">
                    <button class="text-red-500 hover:text-red-600 transition-colors text-xs" @click="confirmDeleteSubject = false">✖</button>
                    <button class="text-green-500 hover:text-green-600 transition-colors text-xs" @click="handleDeleteSubject">✔</button>
                  </template>
                  <button v-else class="text-xs text-muted-foreground hover:text-red-500 transition-colors" @click="confirmDeleteSubject = true">🗑️</button>
                </template>
                <button
                  v-if="(isMod || isSubjectOwner) && canReactivate"
                  class="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  :title="t('forum.unarchive')"
                  @click="handleUnarchiveSubject"
                >📂</button>
                <button
                  v-if="isMod && subject.status !== 'archived'"
                  class="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  @click="handleToggleHideSubject"
                >{{ isHiddenSubject ? '✅' : '🚫' }}</button>
              </div>
            </div>
          </div>
          <UIcon
            name="i-lucide-chevron-down"
            class="w-4 h-4 mt-1 shrink-0 text-muted-foreground transition-transform"
            :class="expanded ? 'rotate-180' : ''"
          />
        </div>
      </div>
    </template>

    <template v-if="expanded">
      <!-- Edition sujet -->
      <div v-if="isEditingSubject" class="space-y-2 pb-2">
        <UInput v-model="editTitle" class="text-sm font-semibold" :maxlength="255" />
        <UTextarea v-model="editContent" :rows="5" class="text-sm" />
        <div class="flex gap-2">
          <UButton size="xs" :disabled="savingSubject || !editTitle.trim() || !editContent.trim()" @click="handleSaveSubject">
            {{ savingSubject ? '…' : t('forum.save') }}
          </UButton>
          <UButton size="xs" variant="ghost" @click="isEditingSubject = false; editTitle = subject.title; editContent = subject.content">
            {{ t('forum.cancel') }}
          </UButton>
        </div>
      </div>

      <!-- Contenu sujet -->
      <template v-else>
        <p
          class="text-sm"
          :class="!subjectContentExpanded && isSubjectLong ? 'overflow-hidden max-h-[3.75rem]' : ''"
          v-html="forumRenderWithLinks(subject.content)"
        />
        <button v-if="isSubjectLong" class="text-yellow-400 hover:text-yellow-500 transition-colors leading-none" @click="subjectContentExpanded = !subjectContentExpanded">
          {{ subjectContentExpanded ? '▲' : '▼' }}
        </button>
      </template>

      <hr class="my-2 border-border/30" />

      <p v-if="loading" class="text-sm text-muted-foreground">{{ t('common.loading') }}</p>
      <p v-else-if="comments !== null && comments.length === 0" class="text-sm text-muted-foreground">{{ t('forum.noComments') }}</p>

      <!-- Commentaires épinglés -->
      <template v-for="comment in pinned" :key="comment.id">
        <div
          :id="`comment-${comment.id}`"
          :class="comment.id === highlightCommentId
            ? 'border-l-4 border-green-500 bg-green-50 dark:bg-green-900/30 rounded-r-md pl-3 py-1'
            : 'border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-900/30 rounded-r-md pl-3 py-1'"
        >
          <ForumCommentRow
            :comment="comment"
            :has-replies="getReplies(comment.id).length > 0"
            :user-id="userId"
            :is-mod="isMod"
            :lang="lang"
            :read-only="readOnly"
            @like="handleLike"
            @reply="handleReply"
            @refresh="loadComments"
          />
          <!-- Réponses -->
          <div v-if="getReplies(comment.id).length > 0" class="ml-7 mt-2 space-y-3 border-l-2 border-muted pl-3">
            <div
              v-for="reply in getReplies(comment.id)"
              :id="`comment-${reply.id}`"
              :key="reply.id"
              :class="reply.id === highlightCommentId
                ? 'border-l-4 border-green-500 bg-green-50 dark:bg-green-900/30 rounded-r-md -ml-3 pl-3 py-1'
                : reply.isStaff
                ? 'border-l-4 border-teal-400 bg-zinc-50 dark:bg-zinc-800/40 rounded-r-md -ml-3 pl-3 py-1'
                : ''"
            >
              <ForumCommentRow
                :comment="reply"
                :parent-comment="comment"
                :user-id="userId"
                :is-mod="isMod"
                :lang="lang"
                :read-only="readOnly"
                @like="handleLike"
                @reply="handleReply"
                @refresh="loadComments"
              />
            </div>
          </div>
        </div>
      </template>

      <hr v-if="pinned.length > 0 && regular.length > 0" class="my-1 border-border/30" />

      <!-- Commentaires normaux -->
      <template v-for="comment in regular" :key="comment.id">
        <div
          :id="`comment-${comment.id}`"
          :class="comment.id === highlightCommentId
            ? 'border-l-4 border-green-500 bg-green-50 dark:bg-green-900/30 rounded-r-md pl-3 py-1'
            : comment.isStaff
            ? 'border-l-4 border-teal-400 bg-zinc-50 dark:bg-zinc-800/40 rounded-r-md pl-3 py-1'
            : 'border-b border-border/30 last:border-0'"
        >
          <ForumCommentRow
            :comment="comment"
            :has-replies="getReplies(comment.id).length > 0"
            :user-id="userId"
            :is-mod="isMod"
            :lang="lang"
            :read-only="readOnly"
            @like="handleLike"
            @reply="handleReply"
            @refresh="loadComments"
          />
          <!-- Réponses -->
          <div v-if="getReplies(comment.id).length > 0" class="ml-7 mt-2 space-y-3 border-l-2 border-muted pl-3">
            <div
              v-for="reply in getReplies(comment.id)"
              :id="`comment-${reply.id}`"
              :key="reply.id"
              :class="reply.id === highlightCommentId
                ? 'border-l-4 border-green-500 bg-green-50 dark:bg-green-900/30 rounded-r-md -ml-3 pl-3 py-1'
                : reply.isStaff
                ? 'border-l-4 border-teal-400 bg-zinc-50 dark:bg-zinc-800/40 rounded-r-md -ml-3 pl-3 py-1'
                : ''"
            >
              <ForumCommentRow
                :comment="reply"
                :parent-comment="comment"
                :user-id="userId"
                :is-mod="isMod"
                :lang="lang"
                :read-only="readOnly"
                @like="handleLike"
                @reply="handleReply"
                @refresh="loadComments"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- Formulaire nouveau commentaire -->
      <div v-if="!isArchived && !readOnly" class="space-y-2 pt-2">
        <p v-if="replyTo" class="text-xs text-muted-foreground">
          ↩️ {{ t('forum.replyTo') }}
          <strong>{{ replyTo.displayName }}</strong>
          <button class="ml-2 underline" @click="replyTo = null">{{ t('forum.cancel') }}</button>
        </p>
        <UTextarea
          v-model="commentText"
          :placeholder="t('forum.writeComment')"
          :rows="3"
        />
        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
        <UButton size="xs" :disabled="submitting || !commentText.trim()" @click="handleSubmitComment">
          {{ submitting ? '…' : t('forum.send') }}
        </UButton>
      </div>
    </template>
  </UCard>
</template>
