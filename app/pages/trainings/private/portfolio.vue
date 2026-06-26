<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <main class="max-w-3xl mx-auto px-6 py-10">
    <h1 class="text-3xl font-bold mb-4">Formation Portfolio</h1>
    <p class="text-muted-foreground mb-2">{{ t('formation.comingSoon') }}</p>
    <p class="text-sm text-muted-foreground">{{ t('formation.comingSoonDesc') }}</p>
  </main>
</template>
