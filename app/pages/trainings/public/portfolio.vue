<script setup lang="ts">
const { t, locale } = useI18n()

const { data: training } = await useFetch('/api/trainings/by-code', {
  query: { code: 'PORTFOLIO' },
})
</script>

<template>
  <main class="max-w-3xl mx-auto px-6 py-10">
    <template v-if="training">
      <h1 class="text-3xl font-bold mb-4">{{ training.title }}</h1>
      <div class="prose max-w-none" v-html="training.descriptionHtml" />
      <div class="mt-8">
        <NuxtLink to="/catalog">
          <UButton size="lg">{{ t('catalog.buy') }}</UButton>
        </NuxtLink>
      </div>
    </template>
    <template v-else>
      <h1 class="text-3xl font-bold mb-4">Formation Portfolio</h1>
      <p class="text-muted-foreground">{{ t('common.loading') }}</p>
    </template>
  </main>
</template>
