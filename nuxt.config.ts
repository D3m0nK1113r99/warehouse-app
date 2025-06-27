export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2024-04-03',
  nitro: {
    preset: 'node-server'
  },
  runtimeConfig: {
    public: {
      directusUrl: process.env.DIRECTUS_URL || 'http://localhost:8055'
    }
  }
})