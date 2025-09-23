export default defineNuxtConfig({
  devtools: { enabled: true },

  css: [
    '@/assets/css/main.css',
    '@/assets/css/components.css',
    '@/assets/css/calendar.css',
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://172.17.197.58:8080/api',
    },
  },

  nitro: {
    compatibilityDate: '2025-09-19',
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'ru',
      },
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap',
        },
        {
          rel: 'icon',
          type: 'image/webp',
          href: '/favicon.webp', // <-- твоя иконка
        },
      ],
    },
  },

  plugins: [
    { src: '~/plugins/toast.client.ts', mode: 'client' },
    '~/plugins/v-calendar.ts',
  ],
})
