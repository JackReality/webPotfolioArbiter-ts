export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxt/ui',
    '@nuxtjs/i18n',
  ],

  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'fr',
    locales: [
      { code: 'fr', file: 'fr.json' },
      { code: 'en', file: 'en.json' },
      { code: 'es', file: 'es.json' },
    ],
    // @nuxtjs/i18n v10 : langDir est relatif au dossier i18n/ (restructureDir par défaut)
    langDir: 'locales/',
    detectBrowserLanguage: false,
  },
})
