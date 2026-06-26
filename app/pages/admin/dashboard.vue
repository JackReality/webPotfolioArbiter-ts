<script setup lang="ts">
const sections = [
  {
    title: 'Utilisateurs',
    description: 'Gérer les comptes, rôles et suppressions',
    to: '/admin/users',
    icon: 'i-lucide-users',
  },
  {
    title: 'Formations',
    description: 'Ajouter, modifier ou supprimer des formations',
    to: '/admin/trainings',
    icon: 'i-lucide-book-open',
  },
  {
    title: 'Templates emails',
    description: 'Éditer les emails transactionnels (FR/EN/ES)',
    to: '/admin/email-templates',
    icon: 'i-lucide-mail',
  },
]
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
    <UCard v-for="s in sections" :key="s.to" class="flex flex-col justify-between">
      <template #header>
        <div class="flex items-center gap-4">
          <UIcon :name="s.icon" class="w-8 h-8 text-primary" />
          <h2 class="font-semibold text-lg">{{ s.title }}</h2>
        </div>
      </template>
      <p class="text-sm text-muted mb-4">{{ s.description }}</p>
      <NuxtLink :to="s.to">
        <UButton>Accéder</UButton>
      </NuxtLink>
    </UCard>
  </div>
</template>
