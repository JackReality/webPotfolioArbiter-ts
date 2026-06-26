<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="min-h-[80vh] flex flex-col items-center justify-center gap-4 text-center px-4">
    <h1 class="text-3xl font-bold">{{ t('stripeError.title') }}</h1>
    <p class="text-muted-foreground">{{ t('stripeError.message') }}</p>
    <div class="flex gap-3">
      <NuxtLink to="/catalog">
        <UButton variant="outline">{{ t('stripeError.backToCatalog') }}</UButton>
      </NuxtLink>
      <NuxtLink to="/contact">
        <UButton>{{ t('stripeError.contactUs') }}</UButton>
      </NuxtLink>
    </div>
  </div>
</template>
