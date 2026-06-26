<script setup lang="ts">
const { data: rawTrainings } = await useFetch<any[]>('/api/admin/trainings')
const trainings = ref<any[]>(rawTrainings.value ?? [])

const dialogOpen = ref(false)
const editingId = ref<number | null>(null)
const error = ref('')
const success = ref('')
const loading = ref(false)

const LANGS = ['fr', 'en', 'es']

interface FormData {
  title: string
  code: string
  language: string
  descriptionHtml: string
  stripeProductId: string
  stripePriceId: string
  confirmationEmailHtml: string
  privatePageUrl: string
  publicPageUrl: string
  isFree: boolean
  allowRepurchase: boolean
  axsCommunityMonths: string
}

const emptyForm = (): FormData => ({
  title: '', code: '', language: 'fr', descriptionHtml: '',
  stripeProductId: '', stripePriceId: '', confirmationEmailHtml: '',
  privatePageUrl: '', publicPageUrl: '', isFree: false, allowRepurchase: false, axsCommunityMonths: '',
})

const form = ref<FormData>(emptyForm())

const langItems = LANGS.map(l => ({ label: l.toUpperCase(), value: l }))

function openAdd() {
  editingId.value = null
  form.value = emptyForm()
  error.value = ''
  success.value = ''
  dialogOpen.value = true
}

async function openEdit(tr: any) {
  editingId.value = tr.id
  error.value = ''
  success.value = ''
  const data = await $fetch<any>(`/api/admin/trainings/${tr.id}`)
  form.value = {
    title: data.title,
    code: data.code,
    language: data.language,
    descriptionHtml: data.descriptionHtml,
    stripeProductId: data.stripeProductId ?? '',
    stripePriceId: data.stripePriceId ?? '',
    confirmationEmailHtml: data.confirmationEmailHtml ?? '',
    privatePageUrl: data.privatePageUrl ?? '',
    publicPageUrl: data.publicPageUrl ?? '',
    isFree: data.isFree,
    allowRepurchase: data.allowRepurchase,
    axsCommunityMonths: data.axsCommunityMonths != null ? String(data.axsCommunityMonths) : '',
  }
  dialogOpen.value = true
}

async function handleSubmit() {
  loading.value = true
  error.value = ''
  success.value = ''

  const payload = {
    title: form.value.title,
    code: form.value.code,
    language: form.value.language,
    descriptionHtml: form.value.descriptionHtml,
    stripeProductId: form.value.stripeProductId || null,
    stripePriceId: form.value.stripePriceId || null,
    confirmationEmailHtml: form.value.confirmationEmailHtml || null,
    privatePageUrl: form.value.privatePageUrl || null,
    publicPageUrl: form.value.publicPageUrl || null,
    isFree: form.value.isFree,
    allowRepurchase: form.value.allowRepurchase,
    axsCommunityMonths: form.value.axsCommunityMonths ? Number(form.value.axsCommunityMonths) : null,
  }

  const isAdd = editingId.value === null
  const url = isAdd ? '/api/admin/trainings' : `/api/admin/trainings/${editingId.value}`
  const method = isAdd ? 'POST' : 'PATCH'

  try {
    const data = await $fetch<any>(url, { method, body: payload })
    if (isAdd) {
      window.location.reload()
    } else {
      const idx = trainings.value.findIndex(t => t.id === editingId.value)
      if (idx !== -1) trainings.value[idx] = { ...trainings.value[idx], ...payload }
      success.value = 'Enregistré.'
      setTimeout(() => { dialogOpen.value = false }, 800)
    }
  } catch (e: any) {
    error.value = e.data?.error ?? 'Erreur'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <NuxtLink to="/admin/dashboard" class="text-sm text-muted hover:underline">← Retour</NuxtLink>

    <h2 class="text-2xl font-semibold mt-4 mb-2">Gestion des formations</h2>
    <p class="text-sm text-muted mb-4">Ajouter, modifier ou supprimer des formations.</p>

    <div class="flex justify-end mb-4">
      <UButton @click="openAdd">Ajouter une formation</UButton>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b text-left">
            <th class="py-2 pr-4">Code</th>
            <th class="py-2 pr-4">Titre</th>
            <th class="py-2 pr-4">Langue</th>
            <th class="py-2 pr-4">Page privée</th>
            <th class="py-2 pr-4">Communauté (mois)</th>
            <th class="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tr in trainings" :key="tr.id" class="border-b">
            <td class="py-2 pr-4 font-mono text-sm">{{ tr.code }}</td>
            <td class="py-2 pr-4">{{ tr.title }}</td>
            <td class="py-2 pr-4">{{ tr.language?.toUpperCase() }}</td>
            <td class="py-2 pr-4 text-muted text-sm">{{ tr.privatePageUrl ?? '—' }}</td>
            <td class="py-2 pr-4">{{ tr.axsCommunityMonths ?? '—' }}</td>
            <td class="py-2">
              <UButton variant="outline" size="xs" @click="openEdit(tr)">Modifier</UButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Dialog ajouter / modifier -->
    <UModal
      v-model:open="dialogOpen"
      :title="editingId === null ? 'Ajouter une formation' : 'Modifier la formation'"
      :ui="{ content: 'sm:max-w-3xl max-h-[90vh] overflow-y-auto' }"
    >
      <div class="space-y-4 py-2">
        <div v-if="editingId === null" class="space-y-1">
          <label class="text-sm font-medium">Code</label>
          <UInput v-model="form.code" placeholder="ex: PORTFOLIO" />
        </div>
        <div v-else class="space-y-1">
          <label class="text-sm font-medium">Code</label>
          <p class="font-mono font-semibold text-sm">{{ form.code }}</p>
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium">Titre</label>
          <UInput v-model="form.title" />
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium">Langue</label>
          <USelect v-model="form.language" :items="langItems" value-key="value" class="w-32" />
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium">Description (HTML)</label>
          <UTextarea v-model="form.descriptionHtml" :rows="5" />
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium">URL page publique</label>
          <UInput v-model="form.publicPageUrl" placeholder="ex: /formation/portfolio" />
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium">URL page privée</label>
          <UInput v-model="form.privatePageUrl" placeholder="ex: /training_portfolio" />
        </div>

        <div class="flex items-center gap-2">
          <input
            id="isFree"
            v-model="form.isFree"
            type="checkbox"
            class="h-4 w-4"
            @change="() => { if (form.isFree) form.allowRepurchase = false }"
          />
          <label for="isFree" class="text-sm font-medium">Formation gratuite</label>
        </div>

        <div class="flex items-center gap-2">
          <input
            id="allowRepurchase"
            v-model="form.allowRepurchase"
            type="checkbox"
            class="h-4 w-4"
          />
          <label for="allowRepurchase" class="text-sm font-medium">Autoriser le rachat</label>
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium">Mois d'accès communauté</label>
          <UInput v-model="form.axsCommunityMonths" type="number" min="1" max="120" placeholder="ex: 3" class="w-32" />
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium">Stripe Product ID</label>
          <UInput v-model="form.stripeProductId" />
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium">Stripe Price ID</label>
          <UInput v-model="form.stripePriceId" />
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium">Email de confirmation (HTML)</label>
          <UTextarea v-model="form.confirmationEmailHtml" :rows="5" />
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <p v-if="success" class="text-sm text-green-600">{{ success }}</p>
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <UButton variant="outline" @click="dialogOpen = false">Annuler</UButton>
        <UButton :disabled="loading" @click="handleSubmit">Enregistrer</UButton>
      </div>
    </UModal>
  </div>
</template>
