<script setup lang="ts">
const { data: rawTemplates } = await useFetch<any[]>('/api/admin/email-templates')

const KEYS = ['confirm_signup', 'recovery', 'welcome'] as const
const LANGS = ['fr', 'en', 'es'] as const

const KEY_LABELS: Record<string, string> = {
  confirm_signup: 'Confirmation inscription',
  recovery: 'Réinitialisation mot de passe',
  welcome: 'Bienvenue',
}

const grouped = computed(() => {
  const g: Record<string, Record<string, any>> = {}
  for (const key of KEYS) {
    g[key] = {}
    for (const lang of LANGS) {
      const found = (rawTemplates.value ?? []).find((t: any) => t.key === key && t.language === lang)
      if (found) g[key][lang] = found
    }
  }
  return g
})

const forms = ref<Record<number, { subject: string; html: string }>>({})
const feedback = ref<Record<number, { msg: string; isError: boolean }>>({})
const loading = ref<Record<number, boolean>>({})

watch(rawTemplates, (tpls) => {
  if (!tpls) return
  for (const tpl of tpls) {
    if (!forms.value[tpl.id]) {
      forms.value[tpl.id] = { subject: tpl.subject, html: tpl.html }
    }
  }
}, { immediate: true })

const activeKey = ref<string>(KEYS[0])
const activeLang = ref<string>('fr')

function setMsg(id: number, msg: string, isError = false) {
  feedback.value[id] = { msg, isError }
  setTimeout(() => { feedback.value[id] = { msg: '', isError: false } }, 3000)
}

async function handleSave(id: number) {
  loading.value[id] = true
  try {
    await $fetch(`/api/admin/email-templates/${id}`, {
      method: 'PATCH',
      body: forms.value[id],
    })
    setMsg(id, 'Enregistré.')
  } catch (e: any) {
    setMsg(id, e.data?.error ?? 'Erreur', true)
  } finally {
    loading.value[id] = false
  }
}
</script>

<template>
  <div>
    <NuxtLink to="/admin/dashboard" class="text-sm text-muted hover:underline">← Retour</NuxtLink>

    <h2 class="text-2xl font-semibold mt-4 mb-2">Templates emails</h2>
    <p class="text-sm text-muted mb-6">Éditer les emails transactionnels.</p>

    <!-- Onglets type d'email -->
    <div class="flex gap-2 mb-6 border-b">
      <button
        v-for="key in KEYS"
        :key="key"
        class="px-4 py-2 text-sm font-medium transition-colors"
        :class="activeKey === key
          ? 'border-b-2 border-primary text-primary'
          : 'text-muted hover:text-foreground'"
        @click="activeKey = key"
      >
        {{ KEY_LABELS[key] }}
      </button>
    </div>

    <!-- Onglets langue -->
    <div class="flex gap-2 mb-6">
      <button
        v-for="lang in LANGS"
        :key="lang"
        class="px-4 py-1.5 text-sm font-medium rounded transition-colors"
        :class="activeLang === lang
          ? 'bg-primary text-white'
          : 'bg-muted text-muted-foreground hover:bg-muted/80'"
        @click="activeLang = lang"
      >
        {{ lang.toUpperCase() }}
      </button>
    </div>

    <!-- Contenu -->
    <template v-for="key in KEYS" :key="key">
      <template v-if="activeKey === key">
        <template v-for="lang in LANGS" :key="lang">
          <template v-if="activeLang === lang">
            <template v-if="grouped[key]?.[lang]">
              <div class="space-y-4 max-w-3xl">
                <div class="space-y-1">
                  <label class="text-sm font-medium">Sujet</label>
                  <UInput v-model="forms[grouped[key][lang].id].subject" />
                </div>
                <div class="space-y-1">
                  <label class="text-sm font-medium">Corps (HTML)</label>
                  <UTextarea
                    v-model="forms[grouped[key][lang].id].html"
                    :rows="14"
                    class="font-mono text-sm"
                  />
                </div>
                <p
                  v-if="feedback[grouped[key][lang].id]?.msg"
                  class="text-sm"
                  :class="feedback[grouped[key][lang].id].isError ? 'text-red-600' : 'text-green-600'"
                >
                  {{ feedback[grouped[key][lang].id].msg }}
                </p>
                <UButton
                  :disabled="loading[grouped[key][lang].id]"
                  @click="handleSave(grouped[key][lang].id)"
                >
                  Enregistrer
                </UButton>
              </div>
            </template>
            <p v-else class="text-sm text-muted">Template introuvable en base de données.</p>
          </template>
        </template>
      </template>
    </template>
  </div>
</template>
