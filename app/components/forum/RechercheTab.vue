<script setup lang="ts">
const { t } = useI18n()

interface CommentWithContext {
  id: number; forumSubjectId: number; forumCommentId: number | null; userId: number; displayName: string; addressedTo: string | null
  content: string; status: string; isPinned: boolean; isStaff: boolean; likes: number[]; createdAt: string; updatedAt: string | null
  subject: { id: number; type: string; title: string; status: string }
  parent: { id: number; displayName: string; content: string; status: string } | null
}
interface SearchSubject { id: number; type: string; title: string; displayName: string; content: string; status: string; isStaff: boolean; createdAt: string; _count: { comments: number } }
interface SearchResults { subjects: SearchSubject[]; comments: CommentWithContext[] }

const props = defineProps<{
  lang: string
  userId: number
  userRole: string
  displayName: string
  isMod: boolean
}>()

const threeMonthsAgo = new Date()
threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

const toDateInput = (d: Date) => d.toISOString().split('T')[0]

const query = ref('')
const author = ref('')
const addressee = ref('')
const staffOnly = ref(false)
const dateFrom = ref(toDateInput(threeMonthsAgo))
const dateTo = ref(toDateInput(new Date()))

const results = ref<SearchResults | null>(null)
const loading = ref(false)
const openSubjectId = ref<number | null>(null)
const openCommentId = ref<number | null>(null)

async function handleSearch() {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (query.value.trim()) params.set('q', query.value.trim())
    if (author.value.trim()) params.set('author', author.value.trim())
    if (addressee.value.trim()) params.set('addressee', addressee.value.trim())
    if (staffOnly.value) params.set('staff', '1')
    if (dateFrom.value) params.set('from', dateFrom.value)
    if (dateTo.value) params.set('to', dateTo.value)

    const data = await $fetch<SearchResults>(`/api/forum/search?${params}`)
    results.value = (data as any)?.error ? null : data
  } catch (e) {
    console.error('[RechercheTab] fetch error', e)
  } finally {
    loading.value = false
  }
}

const feed = computed(() => {
  if (!results.value) return []
  return [
    ...results.value.subjects.map(s => ({ kind: 'subject' as const, item: s })),
    ...results.value.comments.map(c => ({ kind: 'comment' as const, item: c })),
  ].sort((a, b) => b.item.createdAt.localeCompare(a.item.createdAt))
})
</script>

<template>
  <div class="space-y-4">
    <!-- Formulaire recherche -->
    <div class="grid grid-cols-2 gap-3">
      <div class="space-y-1">
        <label class="text-xs text-muted-foreground">{{ t('forum.searchQuery') }}</label>
        <UInput v-model="query" :placeholder="t('forum.searchPlaceholder')" @keydown.enter="handleSearch" />
      </div>
      <div class="space-y-1">
        <label class="text-xs text-muted-foreground">{{ t('forum.searchAuthor') }}</label>
        <UInput v-model="author" @keydown.enter="handleSearch" />
      </div>
      <div class="space-y-1">
        <label class="text-xs text-muted-foreground">{{ t('forum.searchAddressee') }}</label>
        <UInput v-model="addressee" @keydown.enter="handleSearch" />
      </div>
      <div class="flex items-center gap-2 pt-5">
        <input id="staff-only" v-model="staffOnly" type="checkbox" class="w-4 h-4 accent-teal-500" />
        <label for="staff-only" class="text-sm cursor-pointer">{{ t('forum.searchStaff') }}</label>
      </div>
      <div class="space-y-1">
        <label class="text-xs text-muted-foreground">{{ t('forum.searchFrom') }}</label>
        <UInput v-model="dateFrom" type="date" />
      </div>
      <div class="space-y-1">
        <label class="text-xs text-muted-foreground">{{ t('forum.searchTo') }}</label>
        <UInput v-model="dateTo" type="date" />
      </div>
    </div>
    <UButton size="xs" :disabled="loading" @click="handleSearch">
      {{ loading ? '…' : t('forum.searchButton') }}
    </UButton>

    <p v-if="results !== null && feed.length === 0" class="text-sm text-muted-foreground py-4">{{ t('forum.searchEmpty') }}</p>

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
          <div :class="['border rounded p-2', entry.item.isStaff ? 'border-l-4 border-l-teal-400 bg-zinc-50 dark:bg-zinc-800/40' : 'bg-card']">
            <div class="flex gap-2">
              <span class="text-sm mt-0.5">{{ entry.item.forumCommentId !== null ? '↩️' : '🗨️' }}</span>
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-baseline gap-1 text-xs text-muted-foreground">
                  <span class="font-medium text-foreground">{{ entry.item.displayName }}</span>
                  <span>· {{ forumFormatDate(entry.item.createdAt, lang) }}</span>
                  <span v-if="entry.item.forumCommentId !== null && entry.item.addressedTo">(→ {{ entry.item.addressedTo }})</span>
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
