<script setup lang="ts">
const { t } = useI18n()

const codeSent = ref(false)
const code = ref('')
const newPassword = ref('')
const confirm = ref('')
const error = ref('')
const success = ref(false)
const loading = ref(false)

async function sendCode() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/profile/send-code', { method: 'POST' })
    codeSent.value = true
    code.value = ''
  } catch (e: any) {
    error.value = t(e.data?.error ?? 'ERR_EMAIL_SEND')
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  error.value = ''
  if (!code.value || !newPassword.value || !confirm.value) {
    error.value = t('ERR_FIELDS_REQUIRED')
    return
  }
  if (newPassword.value !== confirm.value) {
    error.value = t('ERR_PASSWORD_MISMATCH')
    return
  }
  loading.value = true
  try {
    await $fetch('/api/profile/reset-password', {
      method: 'POST',
      body: { code: code.value, newPassword: newPassword.value },
    })
    success.value = true
  } catch (e: any) {
    const errCode = e.data?.error ?? 'ERR_SYSTEM'
    if (errCode === 'ERR_CODE_MAX_ATTEMPTS') {
      codeSent.value = false
      code.value = ''
    }
    error.value = t(errCode)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="container mx-auto py-10 flex justify-center">
    <UCard class="w-full max-w-md">
      <template #header>
        <h2 class="font-semibold">{{ t('resetPassword.title') }}</h2>
      </template>

      <div class="space-y-4">
        <!-- Succès -->
        <template v-if="success">
          <p class="text-sm text-green-600">{{ t('resetPassword.success') }}</p>
          <NuxtLink to="/subscriber/profile" class="text-sm text-muted-foreground underline">
            {{ t('resetPassword.backToProfile') }}
          </NuxtLink>
        </template>

        <!-- Étape 1 — Demande du code -->
        <template v-else-if="!codeSent">
          <p class="text-sm text-muted-foreground">{{ t('resetPassword.codeInfo') }}</p>
          <UAlert v-if="error" color="error" :description="error" />
          <UButton class="w-full" :loading="loading" :disabled="loading" @click="sendCode">
            {{ t('resetPassword.sendCode') }}
          </UButton>
        </template>

        <!-- Étape 2 — Saisie du code + nouveau MDP -->
        <template v-else>
          <p class="text-sm text-muted-foreground">{{ t('resetPassword.codeSentInfo') }}</p>
          <UAlert v-if="error" color="error" :description="error" />
          <UFormField :label="t('resetPassword.codeLabel')">
            <UInput v-model="code" :maxlength="6" autocomplete="one-time-code" />
          </UFormField>
          <UFormField :label="t('auth.newPassword')">
            <UInput v-model="newPassword" type="password" autocomplete="new-password" />
          </UFormField>
          <UFormField :label="t('auth.confirmPassword')">
            <UInput v-model="confirm" type="password" autocomplete="new-password" />
          </UFormField>
          <UButton class="w-full" :loading="loading" :disabled="loading" @click="handleSubmit">
            {{ t('resetPassword.confirm') }}
          </UButton>
          <button type="button" @click="sendCode" :disabled="loading" class="text-sm text-muted-foreground underline">
            {{ t('resetPassword.resendCode') }}
          </button>
        </template>

        <NuxtLink v-if="!success" to="/subscriber/profile" class="block text-sm text-muted-foreground underline">
          {{ t('resetPassword.backToProfile') }}
        </NuxtLink>
      </div>
    </UCard>
  </main>
</template>
