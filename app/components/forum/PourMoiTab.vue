<script setup lang="ts">
const { t } = useI18n()

interface CommentWithContext {
  id: number; forumSubjectId: number; forumCommentId: number | null; userId: number; displayName: string; addressedTo: string | null
  content: string; status: string; isPinned: boolean; isStaff: boolean; likes: number[]; createdAt: string; updatedAt: string | null
  subject: { id: number; type: string; title: string; status: string }
  parent: { id: number; displayName: string; content: string; status: string } | null
}

const props = defineProps<{
  lang: string
  userId: number
  userRole: string
  displayName: string
  isMod: boolean
}>()

const comments = ref<CommentWithContext[] | null>(null)
const loading = ref(true)
const openSubjectId = ref<number | null>(null)
const openCommentId = ref<number | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    const data = await $fetch<CommentWithContext[]>('/api/forum/for-me')
    comments.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('[PourMoiTab] fetch error', e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-2">
    <p v-if="loading" class="text-sm text-muted-foreground py-4">{{ t('common.loading') }}</p>
    <p v-else-if="!comments || comments.length === 0" class="text-sm text-muted-foreground py-4">{{ t('forum.pourMoiEmpty') }}</p>

    <template v-else>
      <div v-for="c in comments" :key="c.id" class="grid grid-cols-3 gap-2 items-start">
        <div :class="['border rounded p-2', c.isStaff ? 'border-l-4 border-l-teal-400 bg-zinc-50 dark:bg-zinc-800/40' : 'bg-card']">
          <div class="flex gap-2">
            <span class="text-sm mt-0.5">{{ c.forumCommentId !== null ? '↩️' : '🗨️' }}</span>
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-baseline gap-1 text-xs text-muted-foreground">
                <span class="font-medium text-foreground">{{ c.displayName }}</span>
                <span>· {{ forumFormatDate(c.createdAt, lang) }}</span>
                <span v-if="c.forumCommentId !== null && c.addressedTo">(→ {{ c.addressedTo }})</span>
                <span>{{ (c.likes as number[]).includes(userId) ? '❤️' : '🤍' }}{{ c.likes.length > 0 ? ` ${c.likes.length}` : '' }}</span>
                <button class="hover:text-foreground transition-colors" :title="t('forum.viewSubject')" @click="openSubjectId = c.subject.id; openCommentId = c.id">👁️</button>
              </div>
              <p class="text-xs mt-1 line-clamp-2">{{ c.content }}</p>
            </div>
          </div>
        </div>

        <div class="border rounded p-2 bg-muted/20 text-muted-foreground">
          <template v-if="c.forumCommentId !== null && c.parent">
            <div class="flex gap-2">
              <span class="text-sm mt-0.5">🗨️</span>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium">{{ c.parent.displayName }}</p>
                <p class="text-xs mt-0.5 line-clamp-2">{{ c.parent.content }}</p>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="flex gap-2">
              <span class="text-sm">{{ forumTypePicto(c.subject.type) }}</span>
              <p class="text-xs font-medium line-clamp-2">{{ c.subject.title }}</p>
            </div>
          </template>
        </div>

        <div v-if="c.forumCommentId !== null" class="border rounded p-2 bg-muted/10 text-muted-foreground">
          <div class="flex gap-2">
            <span class="text-sm">{{ forumTypePicto(c.subject.type) }}</span>
            <p class="text-xs font-medium line-clamp-2">{{ c.subject.title }}</p>
          </div>
        </div>
        <div v-else />
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
