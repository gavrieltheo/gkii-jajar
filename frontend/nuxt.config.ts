import nodeProcess from 'node:process'

export default defineNuxtConfig({
  modules: ['@bootstrap-vue-next/nuxt'],

  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    '~/assets/css/main.css'
  ],

  runtimeConfig: {
    public: {
      apiBase:
        nodeProcess.env.NUXT_PUBLIC_API_BASE ??
        'http://localhost:3001/api'
    }
  }
})