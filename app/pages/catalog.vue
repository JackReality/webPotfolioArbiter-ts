<script setup lang="ts">
const { t, locale } = useI18n()

const { data: trainings } = await useFetch('/api/catalog', {
  query: { lang: locale },
})

const buyError = ref<Record<number, string>>({})
const buyLoading = ref<Record<number, boolean>>({})

async function handleBuy(trainingId: number) {
  buyError.value[trainingId] = ''
  buyLoading.value[trainingId] = true
  try {
    const data = await $fetch<{ url: string }>('/api/stripe/checkout', {
      method: 'POST',
      body: { trainingId },
    })
    if (data.url) {
      if (data.url.startsWith('http')) {
        window.location.href = data.url
      } else {
        await navigateTo(data.url)
      }
    }
  } catch (e: any) {
    if (e.status === 401) {
      await navigateTo('/login')
      return
    }
    buyError.value[trainingId] = t(e.data?.error ?? 'ERR_SYSTEM')
  } finally {
    buyLoading.value[trainingId] = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-10">
    <h1 class="text-3xl font-bold mb-8">Catalogue</h1>

    <div v-if="!trainings?.length" class="text-center space-y-4 py-16 text-muted-foreground">
      <p>{{ t('formation.comingSoon') }}</p>
      <p class="text-sm">{{ t('formation.comingSoonDesc') }}</p>
      <NuxtLink to="/contact">
        <UButton variant="outline">Contact</UButton>
      </NuxtLink>
    </div>

    <div v-else>
      <div v-for="(training, i) in trainings" :key="training.id">
        <hr v-if="i > 0" class="my-10 border-border" />
        <div>
          <h2 class="text-2xl font-semibold mb-4">{{ training.title }}</h2>
          <div class="prose prose-invert prose-sm max-w-none" v-html="training.descriptionHtml" />
          <div class="my-4 flex gap-3 flex-wrap">
            <div>
              <UAlert v-if="buyError[training.id]" color="error" :description="buyError[training.id]" class="mb-2" />
              <UButton
                size="lg"
                :loading="buyLoading[training.id]"
                :disabled="buyLoading[training.id]"
                @click="handleBuy(training.id)"
              >
                {{ t(training.isFree ? 'catalog.getFree' : 'catalog.buy') }}
              </UButton>
            </div>
            <a v-if="training.publicPageUrl" :href="training.publicPageUrl">
              <UButton variant="outline" size="lg">{{ t('catalog.viewTraining') }}</UButton>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
