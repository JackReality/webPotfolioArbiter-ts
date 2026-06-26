<script setup lang="ts">
const { t } = useI18n()

const { data } = await useFetch('/api/subscriber/resources-url')
const resourcesUrl = computed(() => data.value?.url ?? '#')
</script>

<template>
  <main class="container mx-auto py-10">
    <h1 class="text-2xl font-bold mb-8">{{ t('download.title') }}</h1>
    <UCard class="max-w-md">
      <template #header>
        <h2 class="font-semibold">{{ t('download.cardTitle') }}</h2>
      </template>
      <p class="text-muted-foreground mb-4">{{ t('download.description') }}</p>
      <a :href="resourcesUrl" target="_blank" rel="noopener noreferrer">
        <UButton>{{ t('download.openSheets') }}</UButton>
      </a>
    </UCard>
  </main>
</template>
