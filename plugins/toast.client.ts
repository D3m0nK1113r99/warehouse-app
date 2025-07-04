import Toast, { type PluginOptions, POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

export default defineNuxtPlugin((nuxtApp) => {
  const options: PluginOptions = {
    position: POSITION.TOP_RIGHT,
    timeout: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  }
  nuxtApp.vueApp.use(Toast, options)
})