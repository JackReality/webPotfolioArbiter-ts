<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="min-h-[80vh] flex flex-col items-center justify-center gap-4 text-center px-4">
    <h1 class="text-3xl font-bold">{{ t('accessDenied.title') }}</h1>
    <p class="text-muted-foreground">{{ t('accessDenied.message') }}</p>
    <NuxtLink to="/">
      <UButton variant="outline">{{ t('common.backHome') }}</UButton>
    </NuxtLink>
  </div>
</template>
