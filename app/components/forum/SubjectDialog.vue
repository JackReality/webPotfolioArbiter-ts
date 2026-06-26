<script setup lang="ts">
import type { SubjectData } from './SubjectCard.vue'

const { t } = useI18n()

const props = defineProps<{
  subjectId: number | null
  highlightCommentId?: number | null
  lang: string
  userId: number
  userRole: string
  displayName: string
  isMod: boolean
}>()

const emit = defineEmits<{ close: [] }>()

const subject = ref<SubjectData | null>(null)
const loading = ref(false)
const open = computed(() => props.subjectId !== null)

watch(() => props.subjectId, async (id) => {
  if (!id) { subject.value = null; return }
  loading.value = true
  try {
    const data = await $fetch<SubjectData>(`/api/forum/subjects/${id}`)
    subject.value = (data as any)?.error ? null : data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <UModal
    :open="open"
    :ui="{ content: 'sm:max-w-4xl max-h-[85vh] overflow-y-auto' }"
    @update:open="(val) => { if (!val) emit('close') }"
  >
    <p v-if="loading" class="text-sm text-muted-foreground py-4">{{ t('common.loading') }}</p>
    <ForumSubjectCard
      v-else-if="subject"
      :subject="subject"
      :user-id="userId"
      :user-role="userRole"
      :display-name="displayName"
      :is-mod="isMod"
      :lang="lang"
      :initial-expanded="true"
      :highlight-comment-id="highlightCommentId ?? undefined"
      :read-only="subject.status === 'archived' || subject.status === 'hidden'"
    />
  </UModal>
</template>
