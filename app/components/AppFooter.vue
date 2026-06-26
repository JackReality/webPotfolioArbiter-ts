<script setup lang="ts">
const { t } = useI18n()
const RED = '#841b26'
const year = new Date().getFullYear()
</script>

<template>
  <footer class="bg-black/90 py-5 px-8 text-white">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-4">
        <img src="/images/logo-white.png" alt="Portfolio Arbiter" class="h-9 w-auto" />
        <div>
          <p class="text-white/80 text-sm">© {{ year }} Portfolio Arbiter. {{ t('footer.rights') }}</p>
          <NuxtLink to="/legal" class="text-white/50 text-sm hover:text-white transition-colors">
            {{ t('footer.legal') }}
          </NuxtLink>
        </div>
      </div>
      <a href="https://www.youtube.com/@PortfolioArbiter" target="_blank" rel="noopener noreferrer" aria-label="Chaîne YouTube">
        <svg class="h-8 w-8" :style="{ color: RED }" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      </a>
    </div>
  </footer>
</template>
