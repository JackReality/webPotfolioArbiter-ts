<script setup lang="ts">
const { t } = useI18n()
const session = useState<any>('app-session')

const isMod = computed(() => session.value?.role === 'admin' || session.value?.role === 'moderator')

const BASE_TYPES = [
  { value: 'question', emoji: '❓', labelKey: 'forum.typeQuestion' },
  { value: 'share',    emoji: '💬', labelKey: 'forum.typeShare' },
  { value: 'request',  emoji: '🙋', labelKey: 'forum.typeRequest' },
  { value: 'bug',      emoji: '🐛', labelKey: 'forum.typeBug' },
]

const types = computed(() => isMod.value
  ? [...BASE_TYPES, { value: 'announcement', emoji: '📢', labelKey: 'forum.typeAnnouncement' }]
  : BASE_TYPES)

const typeItems = computed(() => types.value.map(tp => ({
  label: `${tp.emoji} ${t(tp.labelKey)}`,
  value: tp.value,
})))

const type = ref('question')
const title = ref('')
const content = ref('')
const submitting = ref(false)
const error = ref('')

async function handleSubmit() {
  if (!title.value.trim() || !content.value.trim()) return
  submitting.value = true
  error.value = ''
  try {
    await $fetch('/api/forum/subjects', {
      method: 'POST',
      body: { type: type.value, title: title.value.trim(), content: content.value.trim() },
    })
    await navigateTo('/community')
  } catch (e: any) {
    error.value = t(e.data?.error ?? 'ERR_SYSTEM')
    submitting.value = false
  }
}
</script>

<template>
  <main class="container mx-auto py-10 max-w-2xl">
    <UCard>
      <template #header>
        <h1 class="font-semibold text-lg">{{ t('forum.newSubject') }}</h1>
      </template>

      <div class="space-y-4">
        <UFormField :label="t('forum.newSubjectType')">
          <USelect v-model="type" :items="typeItems" value-key="value" />
        </UFormField>

        <UFormField :label="t('forum.newSubjectTitle')">
          <UInput v-model="title" :maxlength="255" :placeholder="t('forum.newSubjectTitle')" />
        </UFormField>

        <UFormField :label="t('forum.newSubjectContent')">
          <UTextarea v-model="content" :rows="6" :placeholder="t('forum.newSubjectContent')" />
        </UFormField>

        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

        <div class="flex gap-3">
          <UButton
            :disabled="submitting || !title.trim() || !content.trim()"
            @click="handleSubmit"
          >
            {{ submitting ? '…' : t('forum.newSubjectSubmit') }}
          </UButton>
          <UButton variant="outline" @click="navigateTo('/community')">
            {{ t('forum.cancel') }}
          </UButton>
        </div>
      </div>
    </UCard>
  </main>
</template>
