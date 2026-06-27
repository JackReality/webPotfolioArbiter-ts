<script setup lang="ts">
const { t } = useI18n()

const session = useState<any>('app-session')

const displayName = ref(session.value?.displayName ?? '')
const nameError = ref('')

const emailStep = ref<'idle' | 'code-sent'>('idle')
const newEmail = ref('')
const otp = ref('')
const emailError = ref('')

const selectedLang = ref(session.value?.language ?? 'fr')

const langItems = [
  { label: 'Français', value: 'fr' },
  { label: 'English', value: 'en' },
  { label: 'Español', value: 'es' },
]

function refreshAndRedirect(lang?: string) {
  const url = lang
    ? `/api/auth/refresh-claims?returnUrl=/subscriber/profile&lang=${lang}`
    : `/api/auth/refresh-claims?returnUrl=/subscriber/profile`
  window.location.href = url
}

async function handleUpdateName() {
  nameError.value = ''
  try {
    await $fetch('/api/profile/update-name', {
      method: 'POST',
      body: { displayName: displayName.value },
    })
    refreshAndRedirect()
  } catch (e: any) {
    nameError.value = t(e.data?.error ?? 'ERR_SYSTEM')
  }
}

async function handleSetLanguage(lang: string) {
  try {
    await $fetch('/api/profile/set-language', {
      method: 'POST',
      body: { language: lang },
    })
    refreshAndRedirect(lang)
  } catch {}
}

async function handleRequestEmailChange() {
  emailError.value = ''
  try {
    await $fetch('/api/profile/request-email-change', {
      method: 'POST',
      body: { newEmail: newEmail.value },
    })
    emailStep.value = 'code-sent'
  } catch (e: any) {
    emailError.value = t(e.data?.error ?? 'ERR_SYSTEM')
  }
}

async function handleConfirmEmailChange() {
  emailError.value = ''
  try {
    await $fetch('/api/profile/confirm-email-change', {
      method: 'POST',
      body: { newEmail: newEmail.value, code: otp.value },
    })
    refreshAndRedirect()
  } catch (e: any) {
    const code = e.data?.error ?? 'ERR_SYSTEM'
    emailError.value = t(code)
    if (code === 'ERR_CODE_MAX_ATTEMPTS' || code === 'ERR_CODE_NOT_FOUND') {
      emailStep.value = 'idle'
      otp.value = ''
    }
  }
}

function cancelEmailChange() {
  emailStep.value = 'idle'
  emailError.value = ''
  otp.value = ''
}
</script>

<template>
  <main class="container mx-auto py-10 max-w-lg">
    <h1 class="text-2xl font-bold mb-8">{{ t('profile.title') }}</h1>

    <div class="space-y-6">

      <!-- Nom affiché -->
      <UCard>
        <template #header>
          <h2 class="font-semibold">{{ t('profile.displayName') }}</h2>
        </template>
        <div class="space-y-3">
          <UFormField :label="t('profile.name')">
            <UInput v-model="displayName" />
          </UFormField>
          <p v-if="nameError" class="text-sm text-red-500">{{ nameError }}</p>
          <UButton @click="handleUpdateName">{{ t('common.save') }}</UButton>
        </div>
      </UCard>

      <!-- Langue -->
      <UCard>
        <template #header>
          <h2 class="font-semibold">{{ t('profile.language') }}</h2>
        </template>
        <USelect
          v-model="selectedLang"
          :items="langItems"
          value-key="value"
          class="w-40"
          @update:model-value="handleSetLanguage"
        />
      </UCard>

      <!-- Changement d'email -->
      <UCard>
        <template #header>
          <h2 class="font-semibold">{{ t('profile.email') }}</h2>
        </template>
        <div class="space-y-3">
          <p class="text-sm text-muted-foreground">{{ t('profile.currentEmail') }} : {{ session?.email }}</p>

          <template v-if="emailStep === 'idle'">
            <UFormField :label="t('profile.newEmail')">
              <UInput v-model="newEmail" type="email" />
            </UFormField>
            <p v-if="emailError" class="text-sm text-red-500">{{ emailError }}</p>
            <UButton @click="handleRequestEmailChange">{{ t('profile.sendCode') }}</UButton>
          </template>

          <template v-else>
            <p class="text-sm">{{ t('profile.codeSentTo') }} {{ newEmail }}.</p>
            <UFormField :label="t('profile.verificationCode')">
              <UInput v-model="otp" :maxlength="6" />
            </UFormField>
            <p v-if="emailError" class="text-sm text-red-500">{{ emailError }}</p>
            <div class="flex gap-2">
              <UButton @click="handleConfirmEmailChange">{{ t('profile.confirm') }}</UButton>
              <UButton variant="outline" @click="cancelEmailChange">{{ t('common.cancel') }}</UButton>
            </div>
          </template>
        </div>
      </UCard>

      <!-- Sécurité -->
      <UCard>
        <template #header>
          <h2 class="font-semibold">{{ t('profile.security') }}</h2>
        </template>
        <div class="space-y-2">
          <NuxtLink to="/subscriber/reset-password">
            <UButton variant="outline" class="w-full">{{ t('profile.changePassword') }}</UButton>
          </NuxtLink>
          <NuxtLink v-if="session?.role === 'admin'" to="/admin/dashboard">
            <UButton variant="outline" class="w-full">{{ t('profile.administration') }}</UButton>
          </NuxtLink>
        </div>
      </UCard>

    </div>
  </main>
</template>
