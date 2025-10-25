// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import CanvasJSChart from '@canvasjs/vue-charts';
import { VueQueryPlugin } from '@tanstack/vue-query'
import { queryClient } from './lib/vue-query'

import VueTelInput from 'vue-tel-input'
import 'vue-tel-input/vue-tel-input.css'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(router)
app.use(VueTelInput)
app.use(pinia)
app.use(VueQueryPlugin, {
  queryClient,
})



app.use(CanvasJSChart);

app.mount('#app')

export { pinia }
