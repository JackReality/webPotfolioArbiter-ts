<script setup lang="ts">
const { t } = useI18n()

const RED = '#841b26'
</script>

<template>
  <div class="text-white">

    <!-- SECTION 1 — Hero -->
    <section
      class="bg-cover bg-center bg-no-repeat py-12 px-6"
      style="background-image: url('/images/cahier.jpg')"
    >
      <div class="max-w-6xl mx-auto space-y-6">

        <!-- Boîte 1 — Titre -->
        <div class="bg-black/40 rounded-[30px] p-8">
          <p class="text-center text-base font-semibold text-white mb-1">{{ t('hero.overline') }}</p>
          <h1 class="text-5xl font-extrabold text-white text-center mb-3">{{ t('hero.title') }}</h1>
          <div class="flex justify-center mb-3">
            <div class="h-0.5 w-3/4" :style="{ backgroundColor: RED }" />
          </div>
          <p class="text-center text-white font-semibold">{{ t('hero.subtitle') }}</p>
        </div>

        <!-- Boîte 2 — Ticker -->
        <div class="grid md:grid-cols-2 gap-6 items-center">
          <div class="bg-black/40 rounded-[30px] p-8">
            <h2 class="text-2xl font-bold text-white text-center mb-2">{{ t('moreThanSheet.title') }}</h2>
            <div class="flex justify-center mb-4">
              <div class="h-0.5 w-3/4" :style="{ backgroundColor: RED }" />
            </div>
            <p class="text-white/90 font-semibold whitespace-pre-line text-lg">{{ t('moreThanSheet.desc') }}</p>
          </div>
          <div class="rounded-[30px] overflow-hidden shadow-2xl">
            <img src="/images/ticker-site.png" :alt="t('moreThanSheet.title')" class="w-full object-cover" />
          </div>
        </div>

      </div>
    </section>

    <div class="flex justify-center py-3">
      <div class="h-0.5 w-3/4" :style="{ backgroundColor: RED }" />
    </div>

    <!-- SECTION 2 — Position -->
    <section
      class="bg-cover bg-center bg-no-repeat py-12 px-6"
      style="background-image: url('/images/position-book.png')"
    >
      <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 items-center">
        <div class="rounded-[30px] overflow-hidden shadow-2xl">
          <img src="/images/position-site.png" :alt="t('position.title')" class="w-full object-cover" />
        </div>
        <div class="bg-black/40 rounded-[30px] p-8">
          <h2 class="text-2xl font-bold text-white text-center mb-2">{{ t('position.title') }}</h2>
          <div class="flex justify-center mb-4">
            <div class="h-0.5 w-3/4" :style="{ backgroundColor: RED }" />
          </div>
          <p class="text-white/90 font-semibold whitespace-pre-line text-lg">{{ t('position.desc') }}</p>
        </div>
      </div>
    </section>

    <div class="flex justify-center py-3">
      <div class="h-0.5 w-3/4" :style="{ backgroundColor: RED }" />
    </div>

    <!-- SECTION 3 — Stratégie -->
    <section
      class="bg-cover bg-center bg-no-repeat py-12 px-6"
      style="background-image: url('/images/strategie-book.png')"
    >
      <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 items-center">
        <div class="bg-black/40 rounded-[30px] p-8">
          <h2 class="text-2xl font-bold text-white text-center mb-2">{{ t('strategy.title') }}</h2>
          <div class="flex justify-center mb-4">
            <div class="h-0.5 w-3/4" :style="{ backgroundColor: RED }" />
          </div>
          <div class="space-y-4 text-base text-white/90 font-medium">
            <div>
              <h3 class="text-white font-bold mb-1">{{ t('strategy.groupByStrategy') }}</h3>
              <p class="whitespace-pre-line">{{ t('strategy.groupByStrategyDesc') }}</p>
            </div>
            <div>
              <h3 class="text-white font-bold mb-1">{{ t('strategy.ownCash') }}</h3>
              <p>{{ t('strategy.ownCashDesc') }}</p>
            </div>
            <div>
              <h3 class="text-white font-bold mb-1">{{ t('strategy.autoConvert') }}</h3>
              <p>{{ t('strategy.autoConvertDesc') }}</p>
            </div>
          </div>
        </div>
        <div class="rounded-[30px] overflow-hidden shadow-2xl">
          <img src="/images/strategy-site.png" :alt="t('strategy.title')" class="w-full object-cover" />
        </div>
      </div>
    </section>

    <div class="flex justify-center py-3">
      <div class="h-0.5 w-3/4" :style="{ backgroundColor: RED }" />
    </div>

    <!-- SECTION 4 — Transactions -->
    <section
      class="bg-cover bg-center bg-no-repeat py-12 px-6"
      style="background-image: url('/images/transactions-book.png')"
    >
      <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 items-center">
        <div class="rounded-[30px] overflow-hidden shadow-2xl">
          <img src="/images/transaction-site.png" :alt="t('transactions.title')" class="w-full object-cover" />
        </div>
        <div class="bg-black/40 rounded-[30px] p-8">
          <h2 class="text-2xl font-bold text-white text-center mb-2">{{ t('transactions.title') }}</h2>
          <div class="flex justify-center mb-4">
            <div class="h-0.5 w-3/4" :style="{ backgroundColor: RED }" />
          </div>
          <p class="text-white/90 font-semibold whitespace-pre-line text-lg">{{ t('transactions.desc') }}</p>
        </div>
      </div>
    </section>

    <div class="flex justify-center py-3">
      <div class="h-0.5 w-3/4" :style="{ backgroundColor: RED }" />
    </div>

    <!-- SECTION 5 — Rendement -->
    <section
      class="bg-cover bg-center bg-no-repeat py-12 px-6"
      style="background-image: url('/images/rendement-book.png')"
    >
      <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 items-center">
        <div class="bg-black/40 rounded-[30px] p-8">
          <h2 class="text-2xl font-bold text-white text-center mb-2">{{ t('performance.title') }}</h2>
          <div class="flex justify-center mb-4">
            <div class="h-0.5 w-3/4" :style="{ backgroundColor: RED }" />
          </div>
          <p class="text-white/90 font-semibold whitespace-pre-line text-lg">{{ t('performance.desc') }}</p>
        </div>
        <div class="rounded-[30px] overflow-hidden shadow-2xl">
          <img src="/images/rendement-site.png" :alt="t('performance.title')" class="w-full object-cover" />
        </div>
      </div>
    </section>

    <div class="flex justify-center py-3">
      <div class="h-0.5 w-3/4" :style="{ backgroundColor: RED }" />
    </div>

    <!-- SECTION 6 — Arbitrage -->
    <section
      class="bg-cover bg-center bg-no-repeat py-12 px-6"
      style="background-image: url('/images/arbitrage-bg.png')"
    >
      <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 items-center">
        <div class="rounded-[30px] overflow-hidden shadow-2xl">
          <img src="/images/rebalance-site.png" :alt="t('arbitrage.title')" class="w-full object-cover" />
        </div>
        <div class="bg-black/40 rounded-[30px] p-8">
          <h2 class="text-2xl font-bold text-white text-center mb-2">{{ t('arbitrage.title') }}</h2>
          <div class="flex justify-center mb-4">
            <div class="h-0.5 w-3/4" :style="{ backgroundColor: RED }" />
          </div>
          <p class="text-white/90 font-medium whitespace-pre-line text-base mb-6">{{ t('arbitrage.desc') }}</p>
          <div class="flex justify-center">
            <NuxtLink to="/catalog">
              <UButton size="lg">{{ t('hero.ctaLearn') }}</UButton>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>
