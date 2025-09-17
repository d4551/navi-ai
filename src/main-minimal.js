import { createApp } from 'vue'
import App from './AppMinimal.vue'
// Include Tailwind utilities so minimal shell has consistent spacing/typography
import '@/styles/tailwind.css'

createApp(App).mount('#app')
