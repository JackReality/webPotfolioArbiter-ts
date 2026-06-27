<script setup lang="ts">
const { t } = useI18n()

const name = ref('')
const email = ref('')
const subject = ref('')
const message = ref('')
const trap = ref('')
const error = ref<string | null>(null)
const loading = ref(false)
const success = ref(false)

async function handleSubmit() {
  error.value = null
  loading.value = true
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: { name: name.value, email: email.value, subject: subject.value, message: message.value, trap: trap.value },
    })
    success.value = true
  } catch (e: any) {
    error.value = t(e.data?.error ?? 'ERR_SYSTEM')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <UCard class="w-full max-w-lg">
      <template #header>
        <h2 class="text-base font-semibold">{{ t('contact.title') }}</h2>
        <p class="text-sm text-muted-foreground">{{ t('contact.description') }}</p>
      </template>

      <div v-if="success" class="flex flex-col items-center gap-3 py-6 text-center">
        <UIcon name="i-lucide-check-circle" class="w-12 h-12 text-green-500" />
        <p class="font-semibold text-lg">{{ t('contact.successTitle') }}</p>
        <p class="text-sm text-muted-foreground">{{ t('contact.successDetail') }}</p>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="space-y-4">
        <UAlert v-if="error" color="error" :description="error" />

        <input
          v-model="trap"
          type="text"
          tabindex="-1"
          autocomplete="off"
          style="display: none"
          aria-hidden="true"
        />

        <UFormField :label="t('contact.name')">
          <UInput v-model="name" class="w-full" autocomplete="name" required />
        </UFormField>

        <UFormField :label="t('auth.email')">
          <UInput v-model="email" class="w-full" type="email" autocomplete="email" required />
        </UFormField>

        <UFormField :label="t('contact.subject')">
          <UInput v-model="subject" class="w-full" :maxlength="150" required />
        </UFormField>

        <UFormField :label="t('contact.message')">
          <UTextarea v-model="message" class="w-full" :rows="5" required />
        </UFormField>

        <UButton type="submit" class="w-full" :loading="loading" :disabled="loading">
          {{ loading ? t('contact.sending') : t('contact.send') }}
        </UButton>
      </form>
    </UCard>
  </div>
</template>
