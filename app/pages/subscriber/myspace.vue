<script setup lang="ts">
const { t } = useI18n()

const session = useState<any>('app-session')

const { data } = await useFetch('/api/subscriber/myspace')

const trainings = computed(() => data.value?.trainings ?? [])
const purchases = computed(() => data.value?.purchases ?? [])

const purchaseMap = computed(() => {
  const map = new Map<string, any>()
  for (const p of purchases.value) map.set(p.trainingCode, p)
  return map
})

function formatPrice(training: any): string {
  const purchase = purchaseMap.value.get(training.code)
  if (purchase?.amountCt != null) {
    return `${(purchase.amountCt / 100).toFixed(2)} ${(purchase.currency ?? '').toUpperCase()}`
  }
  return t('myspace.freeAccess')
}
</script>

<template>
  <main class="container mx-auto py-10 space-y-8">
    <h1 class="text-2xl font-bold">{{ t('myspace.title') }}</h1>

    <!-- Ressources -->
    <UCard>
      <template #header>
        <h2 class="font-semibold">{{ t('myspace.resources') }}</h2>
      </template>
      <NuxtLink to="/subscriber/download">
        <UButton>{{ t('myspace.download') }}</UButton>
      </NuxtLink>
    </UCard>

    <!-- Communauté -->
    <UCard v-if="session?.communityAccess">
      <template #header>
        <h2 class="font-semibold">{{ t('community.title') }}</h2>
      </template>
      <NuxtLink to="/community">
        <UButton>{{ t('community.access') }}</UButton>
      </NuxtLink>
    </UCard>

    <!-- Formations -->
    <UCard>
      <template #header>
        <h2 class="font-semibold">{{ t('myspace.formations') }}</h2>
      </template>

      <div v-if="trainings.length === 0" class="space-y-3">
        <p class="text-muted-foreground">{{ t('myspace.noPurchase') }}</p>
        <NuxtLink to="/catalog">
          <UButton variant="outline">{{ t('myspace.viewCatalog') }}</UButton>
        </NuxtLink>
      </div>

      <table v-else class="w-full text-sm">
        <thead>
          <tr class="border-b border-border">
            <th class="text-left py-2 px-3 font-medium text-muted-foreground">{{ t('myspace.colTitle') }}</th>
            <th class="text-left py-2 px-3 font-medium text-muted-foreground">{{ t('myspace.colPrice') }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="training in trainings" :key="training.id" class="border-b border-border last:border-0">
            <td class="py-2 px-3 font-medium">{{ training.title }}</td>
            <td class="py-2 px-3">{{ formatPrice(training) }}</td>
            <td class="py-2 px-3 text-right">
              <NuxtLink :to="training.privatePageUrl ?? '/catalog'">
                <UButton size="sm">{{ t('myspace.access') }}</UButton>
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </UCard>
  </main>
</template>
