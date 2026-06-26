<script setup lang="ts">
const { t, locale } = useI18n()

const step = ref<1 | 2>(1)
const displayName = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const code = ref('')
const error = ref<string | null>(null)
const loading = ref(false)
const success = ref(false)

async function post(body: object) {
  return $fetch('/api/auth/register', {
    method: 'POST',
    body: { ...body, lang: locale.value },
  })
}

async function handleStep1() {
  error.value = null
  if (!displayName.value || !email.value || !password.value || !passwordConfirm.value) {
    error.value = t('ERR_FIELDS_REQUIRED')
    return
  }
  if (password.value !== passwordConfirm.value) {
    error.value = t('ERR_PASSWORD_MISMATCH')
    return
  }
  loading.value = true
  try {
    await post({ action: 'send-code', display_name: displayName.value, email: email.value, password: password.value, passwordConfirm: passwordConfirm.value })
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
    await post({ action: 'verify', email: email.value, code: code.value, display_name: displayName.value, password: password.value })
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
  await post({ action: 'send-code', display_name: displayName.value, email: email.value, password: password.value, passwordConfirm: passwordConfirm.value })
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <UCard class="w-full max-w-sm">
      <template #header>
        <h2 class="text-base font-semibold">{{ t('auth.signUp') }}</h2>
        <p class="text-sm text-muted-foreground">{{ t('auth.signupSubtitle') }}</p>
      </template>

      <div v-if="success" class="space-y-4">
        <UAlert :description="t('auth.signupSuccess')" />
        <NuxtLink to="/login">
          <UButton variant="outline" class="w-full">{{ t('auth.backToLogin') }}</UButton>
        </NuxtLink>
      </div>

      <template v-else>
        <UAlert v-if="error" color="error" :description="error" class="mb-4" />

        <form v-if="step === 1" @submit.prevent="handleStep1" class="space-y-4">
          <UFormField :label="t('auth.displayName')">
            <UInput v-model="displayName" autocomplete="name" required />
          </UFormField>
          <UFormField :label="t('auth.email')">
            <UInput v-model="email" type="email" autocomplete="email" required />
          </UFormField>
          <UFormField :label="t('auth.password')">
            <UInput v-model="password" type="password" autocomplete="new-password" required />
          </UFormField>
          <UFormField :label="t('auth.confirmPassword')">
            <UInput v-model="passwordConfirm" type="password" autocomplete="new-password" required />
          </UFormField>
          <UButton type="submit" class="w-full" :loading="loading" :disabled="loading">
            {{ t('auth.signUp') }}
          </UButton>
        </form>

        <form v-else @submit.prevent="handleStep2" class="space-y-4">
          <p class="text-sm text-muted-foreground">{{ t('auth.signupSentTitle') }} — {{ email }}</p>
          <UFormField :label="t('auth.verificationCode')">
            <UInput v-model="code" :maxlength="6" autocomplete="one-time-code" required />
          </UFormField>
          <UButton type="submit" class="w-full" :loading="loading" :disabled="loading">
            {{ t('auth.verify') }}
          </UButton>
          <button type="button" @click="handleResend" class="text-sm text-muted-foreground hover:text-foreground w-full text-center">
            {{ t('resetPassword.resendCode') }}
          </button>
        </form>

        <p class="mt-4 text-sm text-center text-muted-foreground">
          {{ t('auth.alreadyHaveAccount') }}
          <NuxtLink to="/login" class="text-foreground hover:underline">{{ t('auth.signIn') }}</NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>
