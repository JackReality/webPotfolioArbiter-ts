<script setup lang="ts">
const { t } = useI18n()

interface SuiviSubject {
  id: number; type: string; title: string; content: string; status: string; isStaff: boolean; displayName: string; createdAt: string
}
interface CommentWithContext {
  id: number; forumSubjectId: number; forumCommentId: number | null; userId: number; displayName: string; addressedTo: string | null
  content: string; status: string; isPinned: boolean; isStaff: boolean; likes: number[]; createdAt: string; updatedAt: string | null
  subject: { id: number; type: string; title: string; status: string }
  parent: { id: number; displayName: string; content: string; status: string } | null
}
interface SuiviData { date: string; prev: string | null; next: string | null; subjects: SuiviSubject[]; comments: CommentWithContext[] }

const props = defineProps<{
  initialDate: string | null
  suiviKey: number
  lang: string
  userId: number
  userRole: string
  displayName: string
  isMod: boolean
}>()

const data = ref<SuiviData | null>(null)
const loading = ref(true)
const openSubjectId = ref<number | null>(null)
const openCommentId = ref<number | null>(null)

async function load(date: string, updateLastRead: boolean) {
  loading.value = true
  try {
    data.value = await $fetch<SuiviData>(`/api/forum/suivi?date=${date}`)
  } catch (e) {
    console.error('[SuiviTab] fetch error', e)
  } finally {
    loading.value = false
  }
  if (updateLastRead) {
    await $fetch('/api/forum/last-read', { method: 'PATCH', body: { date } })
  }
}

onMounted(() => {
  const startDate = props.initialDate ?? new Date().toISOString().split('T')[0]
  load(startDate, false)
})

watch(() => props.suiviKey, () => {
  if (props.suiviKey === 0) return
  const dateToLoad = data.value?.date ?? props.initialDate ?? new Date().toISOString().split('T')[0]
  load(dateToLoad, false)
})

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString(
    props.lang === 'fr' ? 'fr-CH' : props.lang === 'es' ? 'es-ES' : 'en-GB',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  )
}

const todayStr = computed(() => new Date().toISOString().split('T')[0])
const isToday = computed(() => data.value?.date === todayStr.value)
const hasContent = computed(() => (data.value?.subjects.length ?? 0) > 0 || (data.value?.comments.length ?? 0) > 0)

function handleToday() { load(todayStr.value, true) }

const feed = computed(() => {
  if (!data.value) return []
  return [
    ...data.value.subjects.map(s => ({ kind: 'subject' as const, item: s })),
    ...data.value.comments.map(c => ({ kind: 'comment' as const, item: c })),
  ].sort((a, b) => a.item.createdAt.localeCompare(b.item.createdAt))
})
</script>

<template>
  <div class="space-y-4">
    <p v-if="loading || !data" class="text-sm text-muted-foreground py-4">{{ t('common.loading') }}</p>

    <template v-else>
      <!-- Navigation date -->
      <div class="flex flex-col items-center gap-1">
        <div class="flex items-center gap-3">
          <UButton variant="outline" size="icon" :disabled="!data.prev" @click="data.prev && load(data.prev, false)">
            <UIcon name="i-lucide-chevron-left" class="w-4 h-4" />
          </UButton>
          <span class="text-sm font-medium capitalize min-w-[220px] text-center">{{ formatDay(data.date) }}</span>
          <UButton variant="outline" size="icon" @click="load(data.next ?? todayStr, true)">
            <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
          </UButton>
        </div>
        <button v-if="!isToday" class="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2" @click="handleToday">
          {{ t('forum.today') }}
        </button>
        <p v-if="!data.prev" class="text-xs text-muted-foreground">{{ t('forum.noPriorPosts') }}</p>
      </div>

      <p v-if="!hasContent" class="text-sm text-muted-foreground text-center py-6">
        {{ isToday ? t('forum.noPostsThisDay') : t('forum.noPostsSince') }}
      </p>

      <!-- Feed 3 colonnes -->
      <div class="space-y-2">
        <template v-for="entry in feed" :key="`${entry.kind}-${entry.item.id}`">
          <!-- Sujet -->
          <div v-if="entry.kind === 'subject'" class="grid grid-cols-3 gap-2 items-start">
            <div :class="['border rounded p-2', entry.item.isStaff ? 'border-l-4 border-l-teal-400 bg-zinc-50 dark:bg-zinc-800/40' : 'bg-card']">
              <div class="flex gap-2">
                <span class="text-base">{{ forumTypePicto(entry.item.type) }}</span>
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-baseline gap-1 text-xs text-muted-foreground">
                    <span class="font-medium text-foreground">{{ entry.item.title }}</span>
                    <span>· {{ entry.item.displayName }}</span>
                    <span>· {{ forumFormatDate(entry.item.createdAt, lang) }}</span>
                    <span v-if="entry.item.status === 'hidden' && isMod" class="text-destructive">🚫</span>
                    <button class="hover:text-foreground transition-colors" :title="t('forum.viewSubject')" @click="openSubjectId = entry.item.id; openCommentId = null">👁️</button>
                  </div>
                  <p class="text-xs mt-1 line-clamp-2 text-muted-foreground">{{ entry.item.content }}</p>
                </div>
              </div>
            </div>
            <div class="col-span-2" />
          </div>

          <!-- Commentaire -->
          <div v-else class="grid grid-cols-3 gap-2 items-start">
            <div :class="['border rounded p-2', entry.item.isStaff ? 'border-l-4 border-l-teal-400 bg-zinc-50 dark:bg-zinc-800/40' : 'bg-card', entry.item.status === 'hidden' ? 'opacity-60' : '']">
              <div class="flex gap-2">
                <span class="text-sm mt-0.5">{{ entry.item.forumCommentId !== null ? '↩️' : '🗨️' }}</span>
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-baseline gap-1 text-xs text-muted-foreground">
                    <span class="font-medium text-foreground">{{ entry.item.displayName }}</span>
                    <span>· {{ forumFormatDate(entry.item.createdAt, lang) }}</span>
                    <span v-if="entry.item.forumCommentId !== null && entry.item.addressedTo">(→ {{ entry.item.addressedTo }})</span>
                    <span v-if="entry.item.status === 'hidden' && isMod" class="text-destructive">🚫</span>
                    <span>{{ (entry.item.likes as number[]).includes(userId) ? '❤️' : '🤍' }}{{ entry.item.likes.length > 0 ? ` ${entry.item.likes.length}` : '' }}</span>
                    <button class="hover:text-foreground transition-colors" :title="t('forum.viewSubject')" @click="openSubjectId = entry.item.subject.id; openCommentId = entry.item.id">👁️</button>
                  </div>
                  <p class="text-xs mt-1 line-clamp-2">{{ entry.item.content }}</p>
                </div>
              </div>
            </div>

            <div class="border rounded p-2 bg-muted/20 text-muted-foreground">
              <template v-if="entry.item.forumCommentId !== null && entry.item.parent">
                <div class="flex gap-2">
                  <span class="text-sm mt-0.5">🗨️</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-medium">{{ entry.item.parent.displayName }}</p>
                    <p class="text-xs mt-0.5 line-clamp-2">{{ entry.item.parent.content }}</p>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="flex gap-2">
                  <span class="text-sm">{{ forumTypePicto(entry.item.subject.type) }}</span>
                  <p class="text-xs font-medium line-clamp-2">{{ entry.item.subject.title }}</p>
                </div>
              </template>
            </div>

            <div v-if="entry.item.forumCommentId !== null" class="border rounded p-2 bg-muted/10 text-muted-foreground">
              <div class="flex gap-2">
                <span class="text-sm">{{ forumTypePicto(entry.item.subject.type) }}</span>
                <p class="text-xs font-medium line-clamp-2">{{ entry.item.subject.title }}</p>
              </div>
            </div>
            <div v-else />
          </div>
        </template>
      </div>
    </template>

    <ForumSubjectDialog
      :subject-id="openSubjectId"
      :highlight-comment-id="openCommentId"
      :lang="lang"
      :user-id="userId"
      :user-role="userRole"
      :display-name="displayName"
      :is-mod="isMod"
      @close="openSubjectId = null; openCommentId = null"
    />
  </div>
</template>
