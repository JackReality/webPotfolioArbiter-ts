<script setup lang="ts">
const { data: rawUsers } = await useFetch<any[]>('/api/admin/users')
const users = ref<any[]>(rawUsers.value ?? [])

const feedback = ref<Record<number, string>>({})

const purchasesOpen = ref(false)
const purchasesUser = ref<any>(null)

const deleteOpen = ref(false)
const deleteId = ref<number | null>(null)

const roleItems = [
  { label: 'subscriber', value: 'subscriber' },
  { label: 'client', value: 'client' },
  { label: 'moderator', value: 'moderator' },
]

function setMsg(id: number, msg: string) {
  feedback.value[id] = msg
  setTimeout(() => { feedback.value[id] = '' }, 3000)
}

async function handleRoleChange(id: number, role: string) {
  try {
    await $fetch(`/api/admin/users/${id}/role`, { method: 'PATCH', body: { role } })
    const user = users.value.find(u => u.id === id)
    if (user) user.role = role
    setMsg(id, 'Rôle mis à jour')
  } catch (e: any) {
    setMsg(id, e.data?.error ?? 'Erreur')
  }
}

function openDelete(id: number) {
  deleteId.value = id
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!deleteId.value) return
  try {
    await $fetch(`/api/admin/users/${deleteId.value}`, { method: 'DELETE' })
    users.value = users.value.filter(u => u.id !== deleteId.value)
  } catch (e: any) {
    setMsg(deleteId.value, e.data?.error ?? 'Erreur')
  }
  deleteOpen.value = false
  deleteId.value = null
}

function openPurchases(user: any) {
  purchasesUser.value = user
  purchasesOpen.value = true
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR')
}
</script>

<template>
  <div>
    <NuxtLink to="/admin/dashboard" class="text-sm text-muted hover:underline">← Retour</NuxtLink>

    <h2 class="text-2xl font-semibold mt-4 mb-2">Gestion des utilisateurs</h2>
    <p class="text-sm text-muted mb-6">Modifier les rôles ou supprimer des comptes.</p>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b text-left">
            <th class="py-2 pr-4">Nom</th>
            <th class="py-2 pr-4">Email</th>
            <th class="py-2 pr-4">Rôle</th>
            <th class="py-2 pr-4">Inscrit le</th>
            <th class="py-2 pr-4">Formations</th>
            <th class="py-2 pr-4">Communauté</th>
            <th class="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="border-b">
            <td class="py-2 pr-4">{{ user.displayName }}</td>
            <td class="py-2 pr-4">{{ user.email }}</td>
            <td class="py-2 pr-4">
              <template v-if="user.role === 'admin'">
                <UBadge color="error" variant="solid">Admin</UBadge>
              </template>
              <template v-else>
                <USelect
                  :model-value="user.role"
                  :items="roleItems"
                  value-key="value"
                  class="w-36"
                  @update:model-value="handleRoleChange(user.id, $event)"
                />
              </template>
              <p v-if="feedback[user.id]" class="text-xs mt-1 text-muted">{{ feedback[user.id] }}</p>
            </td>
            <td class="py-2 pr-4">{{ formatDate(user.createdAt) }}</td>
            <td class="py-2 pr-4">
              <div class="flex items-center gap-2">
                <span>{{ user.userTrainings?.length > 0 ? user.userTrainings.map((ut: any) => ut.trainingCode).join(', ') : '—' }}</span>
                <UButton
                  v-if="user.userTrainings?.length > 0"
                  variant="outline"
                  size="xs"
                  @click="openPurchases(user)"
                >
                  Voir achats
                </UButton>
              </div>
            </td>
            <td class="py-2 pr-4">{{ formatDate(user.axsCommunityExpire) }}</td>
            <td class="py-2">
              <span v-if="user.role === 'admin'" class="text-xs text-muted">Protégé</span>
              <UButton
                v-else
                color="error"
                variant="outline"
                size="xs"
                @click="openDelete(user.id)"
              >
                Supprimer
              </UButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal : confirmation suppression -->
    <UModal v-model:open="deleteOpen" title="Supprimer l'utilisateur">
      <p class="text-sm mb-4">Cette action est irréversible. Confirmer la suppression ?</p>
      <div class="flex gap-2 justify-end">
        <UButton variant="outline" @click="deleteOpen = false">Annuler</UButton>
        <UButton color="error" @click="confirmDelete">Supprimer</UButton>
      </div>
    </UModal>

    <!-- Modal : achats d'un utilisateur -->
    <UModal v-model:open="purchasesOpen" :title="'Achats — ' + (purchasesUser?.displayName ?? '')">
      <p v-if="!purchasesUser?.userTrainings?.length" class="text-sm text-muted">Aucun achat.</p>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b text-left">
              <th class="py-2 pr-4">Code</th>
              <th class="py-2 pr-4">Montant</th>
              <th class="py-2 pr-4">Devise</th>
              <th class="py-2 pr-4">Date</th>
              <th class="py-2">Session Stripe</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in purchasesUser?.userTrainings" :key="i" class="border-b">
              <td class="py-2 pr-4 font-medium">{{ p.trainingCode }}</td>
              <td class="py-2 pr-4">{{ p.amountCt != null ? (p.amountCt / 100).toFixed(2) : '—' }}</td>
              <td class="py-2 pr-4">{{ p.currency ? p.currency.toUpperCase() : '—' }}</td>
              <td class="py-2 pr-4">{{ formatDate(p.purchasedAt) }}</td>
              <td class="py-2 font-mono text-xs text-muted">{{ p.stripeSessionId ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex justify-end mt-4">
        <UButton variant="outline" @click="purchasesOpen = false">Fermer</UButton>
      </div>
    </UModal>
  </div>
</template>
