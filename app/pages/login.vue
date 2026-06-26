<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

const returnUrl = computed(() => String(route.query.returnUrl ?? '/subscriber/myspace'))
const registered = computed(() => route.query.registered === '1')

async function handleSubmit() {
  error.value = null
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    const sessionState = useState('app-session')
    sessionState.value = undefined
    await navigateTo(returnUrl.value)
  } catch (e: any) {
    error.value = t(e.data?.error ?? 'ERR_SYSTEM')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <UCard class="w-full max-w-sm">
      <template #header>
        <h2 class="text-base font-semibold">{{ t('auth.signIn') }}</h2>
        <p class="text-sm text-muted-foreground">{{ t('auth.loginSubtitle') }}</p>
      </template>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <UAlert v-if="registered" :description="t('auth.signupSuccess')" />
        <UAlert v-if="error" color="error" :description="error" />

        <UFormField :label="t('auth.email')">
          <UInput v-model="email" type="email" autocomplete="email" required />
        </UFormField>

        <UFormField :label="t('auth.password')">
          <UInput v-model="password" type="password" autocomplete="current-password" required />
        </UFormField>

        <UButton type="submit" class="w-full" :loading="loading" :disabled="loading">
          {{ t('auth.signIn') }}
        </UButton>
      </form>

      <div class="mt-4 space-y-2 text-sm text-center text-muted-foreground">
        <p>
          <NuxtLink to="/forgot-password" class="hover:text-foreground transition-colors">
            {{ t('auth.forgotPassword') }}
          </NuxtLink>
        </p>
        <p>
          {{ t('auth.noAccount') }}
          <NuxtLink to="/register" class="text-foreground hover:underline">
            {{ t('auth.createAccount') }}
          </NuxtLink>
        </p>
      </div>
    </UCard>
  </div>
</template>
