<script setup lang="ts">
const { t } = useI18n()

const step = ref<1 | 2>(1)
const email = ref('')
const code = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const error = ref<string | null>(null)
const loading = ref(false)
const success = ref(false)

async function post(body: object) {
  return $fetch('/api/auth/forgot-password', { method: 'POST', body })
}

async function handleStep1() {
  error.value = null
  loading.value = true
  try {
    await post({ action: 'send-code', email: email.value })
    step.value = 2
  } catch (e: any) {
    error.value = t(e.data?.error ?? 'ERR_SYSTEM')
  } finally {
    loading.value = false
  }
}

async function handleStep2() {
  error.value = null
  loading.value = true
  try {
    await post({ action: 'verify', email: email.value, code: code.value, newPassword: newPassword.value, confirmPassword: confirmPassword.value })
    success.value = true
  } catch (e: any) {
    error.value = t(e.data?.error ?? 'ERR_SYSTEM')
  } finally {
    loading.value = false
  }
}

async function handleResend() {
  error.value = null
  code.value = ''
  await post({ action: 'send-code', email: email.value })
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <UCard class="w-full max-w-sm">
      <template #header>
        <h2 class="text-xl font-semibold">{{ t('auth.resetTitle') }}</h2>
      </template>

      <div v-if="success" class="space-y-4">
        <UAlert :description="t('auth.passwordUpdated')" />
        <NuxtLink to="/login">
          <UButton variant="outline" class="w-full">{{ t('auth.backToLogin') }}</UButton>
        </NuxtLink>
      </div>

      <template v-else>
        <UAlert v-if="error" color="error" :description="error" class="mb-4" />

        <form v-if="step === 1" @submit.prevent="handleStep1" class="space-y-4">
          <p class="text-sm text-muted-foreground">{{ t('auth.resetSubtitle') }}</p>
          <UFormField :label="t('auth.email')">
            <UInput v-model="email" type="email" autocomplete="email" required />
          </UFormField>
          <UButton type="submit" class="w-full" :loading="loading" :disabled="loading">
            {{ t('auth.sendResetLink') }}
          </UButton>
        </form>

        <form v-else @submit.prevent="handleStep2" class="space-y-4">
          <p class="text-sm text-muted-foreground">{{ t('auth.resetSent') }}</p>
          <UFormField label="Code">
            <UInput v-model="code" :maxlength="6" autocomplete="one-time-code" required />
          </UFormField>
          <UFormField :label="t('auth.newPassword')">
            <UInput v-model="newPassword" type="password" autocomplete="new-password" required />
          </UFormField>
          <UFormField :label="t('auth.confirmPassword')">
            <UInput v-model="confirmPassword" type="password" autocomplete="new-password" required />
          </UFormField>
          <UButton type="submit" class="w-full" :loading="loading" :disabled="loading">
            {{ t('auth.updatePassword') }}
          </UButton>
          <button type="button" @click="handleResend" class="text-sm text-muted-foreground hover:text-foreground w-full text-center">
            {{ t('resetPassword.resendCode') }}
          </button>
        </form>

        <p class="mt-4 text-sm text-center">
          <NuxtLink to="/login" class="text-muted-foreground hover:text-foreground">{{ t('auth.backToLogin') }}</NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>
