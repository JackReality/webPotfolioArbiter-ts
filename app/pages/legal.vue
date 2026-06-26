<script setup lang="ts">
const { t, tm } = useI18n()

const legal = computed(() => tm('legal') as any)
const active = ref('cgv')

const tabs = computed(() => [
  { key: 'cgv', label: legal.value?.tabs?.cgv },
  { key: 'privacy', label: legal.value?.tabs?.privacy },
  { key: 'mentions', label: legal.value?.tabs?.mentions },
])

const CONTACT_EMAIL = 'contact@realityexplorer.com'

function renderContent(content: string): string {
  return content.replace(
    '[email]',
    `<a href="mailto:${CONTACT_EMAIL}" class="text-primary underline">${CONTACT_EMAIL}</a>`
  )
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-10">
    <h1 class="text-3xl font-bold mb-2">{{ legal?.title }}</h1>
    <p class="text-muted-foreground mb-8 text-sm">{{ legal?.intro }}</p>

    <!-- Onglets -->
    <div class="flex gap-1 bg-muted rounded-lg p-1 w-fit mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        @click="active = tab.key"
        :class="[
          'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
          active === tab.key
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- CGV -->
    <div v-if="active === 'cgv'">
      <h2 class="text-xl font-semibold mb-6">{{ legal?.cgv?.title }}</h2>
      <div class="space-y-6">
        <div v-for="(article, i) in legal?.cgv?.articles" :key="i">
          <h3 class="font-semibold text-foreground mb-2">{{ article.title }}</h3>
          <p class="text-muted-foreground text-sm whitespace-pre-line" v-html="renderContent(article.content)" />
        </div>
      </div>
    </div>

    <!-- Politique de confidentialité -->
    <div v-else-if="active === 'privacy'">
      <h2 class="text-xl font-semibold mb-2">{{ legal?.privacy?.title }}</h2>
      <p v-if="legal?.privacy?.intro" class="text-muted-foreground text-sm mb-6">{{ legal.privacy.intro }}</p>
      <div class="space-y-6">
        <div v-for="(article, i) in legal?.privacy?.articles" :key="i">
          <h3 class="font-semibold text-foreground mb-2">{{ article.title }}</h3>
          <p class="text-muted-foreground text-sm whitespace-pre-line" v-html="renderContent(article.content)" />
        </div>
      </div>
    </div>

    <!-- Mentions légales -->
    <div v-else-if="active === 'mentions'">
      <h2 class="text-xl font-semibold mb-6">{{ legal?.mentions?.title }}</h2>
      <div class="space-y-6">
        <div v-for="(article, i) in legal?.mentions?.articles" :key="i">
          <h3 class="font-semibold text-foreground mb-2">{{ article.title }}</h3>
          <p class="text-muted-foreground text-sm whitespace-pre-line" v-html="renderContent(article.content)" />
        </div>
      </div>
    </div>
  </div>
</template>
