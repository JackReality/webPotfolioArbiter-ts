<script setup lang="ts">
import type { SessionData } from '~/server/utils/session'

const { t } = useI18n()
const route = useRoute()
const session = useState<SessionData | null | undefined>('app-session')
const langCookie = useCookie('language')

const menuOpen = ref(false)
const RED = '#841b26'
const LANGS = ['fr', 'en', 'es'] as const

const isLoggedIn = computed(() => !!session.value?.id)
const currentLang = computed(() => session.value?.language ?? langCookie.value ?? 'fr')

const navItems = computed(() => [
  { to: '/', label: t('nav.home') },
  isLoggedIn.value
    ? { to: '/subscriber/myspace', label: t('nav.mySpace') }
    : { to: '/subscriber/download', label: t('nav.download') },
  { to: '/catalog', label: t('nav.formation') },
  { to: '/contact', label: t('nav.contact') },
])

function isActive(path: string) {
  return route.path === path
}
function linkClass(path: string) {
  return isActive(path)
    ? 'font-semibold transition-colors'
    : 'text-muted-foreground hover:text-foreground transition-colors'
}
function linkStyle(path: string) {
  return isActive(path) ? { color: RED } : undefined
}
function langUrl(lang: string) {
  return `/api/language/set?lang=${lang}&returnUrl=${encodeURIComponent(route.path)}`
}
</script>

<template>
  <header class="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4 relative">

      <!-- Logo -->
      <NuxtLink to="/" class="shrink-0">
        <img src="/images/logo-white.png" alt="Portfolio Arbiter" class="h-12 w-auto" />
      </NuxtLink>

      <!-- Navigation desktop -->
      <nav class="hidden md:flex items-center gap-6 text-sm">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="linkClass(item.to)"
          :style="linkStyle(item.to)"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <!-- Droite desktop : langue + auth -->
      <div class="hidden md:flex items-center gap-4">
        <!-- Sélecteur de langue -->
        <div class="flex items-center gap-1 text-sm">
          <span v-for="(lang, i) in LANGS" :key="lang" class="flex items-center gap-1">
            <span v-if="i > 0" class="text-muted-foreground">|</span>
            <a
              :href="langUrl(lang)"
              :class="lang === currentLang ? 'font-semibold transition-colors' : 'text-muted-foreground hover:text-foreground transition-colors'"
              :style="lang === currentLang ? { color: RED } : undefined"
            >
              {{ lang.toUpperCase() }}
            </a>
          </span>
        </div>

        <!-- Auth -->
        <div v-if="isLoggedIn" class="flex items-center gap-3">
          <NuxtLink to="/subscriber/profile" class="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors">
            <UIcon name="i-lucide-user-circle" class="h-6 w-6" />
            <span class="text-xs leading-none mt-0.5">{{ session?.displayName }}</span>
          </NuxtLink>
          <a href="/api/auth/logout" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {{ t('nav.logout') }}
          </a>
        </div>
        <NuxtLink v-else to="/login" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
          {{ t('nav.login') }}
        </NuxtLink>
      </div>

      <!-- Bouton hamburger -->
      <button class="md:hidden p-2 text-foreground" aria-label="Menu" @click="menuOpen = !menuOpen">
        <UIcon :name="menuOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="h-5 w-5" />
      </button>

      <!-- Menu mobile -->
      <div v-if="menuOpen" class="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border z-50 px-6 py-5 flex flex-col gap-4 text-sm">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="linkClass(item.to)"
          :style="linkStyle(item.to)"
          @click="menuOpen = false"
        >
          {{ item.label }}
        </NuxtLink>

        <div class="border-t border-border" />

        <!-- Langue mobile -->
        <div class="flex items-center gap-3">
          <a
            v-for="lang in LANGS"
            :key="lang"
            :href="langUrl(lang)"
            class="font-medium transition-colors"
            :style="lang === currentLang ? { color: RED } : { color: 'var(--muted-foreground)' }"
          >
            {{ lang.toUpperCase() }}
          </a>
        </div>

        <div class="border-t border-border" />

        <!-- Auth mobile -->
        <template v-if="isLoggedIn">
          <NuxtLink to="/subscriber/profile" class="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors" @click="menuOpen = false">
            <UIcon name="i-lucide-user-circle" class="h-5 w-5" />
            {{ t('nav.profile') }}
          </NuxtLink>
          <a href="/api/auth/logout" class="text-muted-foreground hover:text-foreground transition-colors">
            {{ t('nav.logout') }}
          </a>
        </template>
        <NuxtLink v-else to="/login" class="text-muted-foreground hover:text-foreground transition-colors" @click="menuOpen = false">
          {{ t('nav.login') }}
        </NuxtLink>
      </div>

    </div>
  </header>
</template>
