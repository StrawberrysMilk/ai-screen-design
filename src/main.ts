import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Icon } from '@iconify/vue'
import App from './App.vue'
import router from './router'
import './styles/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/dist/index.css'
import '@/mock/data.ts'
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.component('Icon', Icon)
app.mount('#app')
