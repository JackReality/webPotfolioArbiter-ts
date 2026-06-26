<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

const code = computed(() => String(route.query.code ?? ''))

const { data: training } = await useFetch('/api/trainings/by-code', {
  query: { code },
})
</script>

<template>
  <main class="container mx-auto py-10 flex justify-center">
    <UCard class="max-w-md w-full text-center">
      <template #header>
        <h2 class="text-2xl font-semibold">{{ t('stripeSuccess.title') }}</h2>
      </template>

      <div class="space-y-4">
        <template v-if="training">
          <p class="text-muted-foreground">{{ t('stripeSuccess.accessNow') }}</p>
          <p class="text-xl font-semibold">{{ training.title }}</p>
          <NuxtLink :to="training.privatePageUrl ?? '#'">
            <UButton class="w-full">{{ t('stripeSuccess.goToTraining') }}</UButton>
          </NuxtLink>
        </template>
        <template v-else>
          <p class="text-muted-foreground">{{ t('stripeSuccess.registered') }}</p>
        </template>

        <NuxtLink to="/subscriber/myspace">
          <UButton variant="outline" class="w-full">{{ t('stripeSuccess.mySpace') }}</UButton>
        </NuxtLink>
      </div>
    </UCard>
  </main>
</template>
