import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
