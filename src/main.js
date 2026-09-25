import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import { useAvisoStore } from '@/stores/aviso'

import './assets/main.css'
import './assets/layout.css'
import './assets/components.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

const aviso = useAvisoStore()

// Erros HTTP já viraram popup no interceptor do axios; aqui só o que sobra.
function avisarErroInesperado(erro) {
  console.error(erro)
  if (axios.isAxiosError(erro)) return
  aviso.mostrar('Ocorreu um erro inesperado na tela. Se persistir, recarregue a página.')
}

app.config.errorHandler = avisarErroInesperado
window.addEventListener('error', (evento) => avisarErroInesperado(evento.error ?? evento.message))
window.addEventListener('unhandledrejection', (evento) => avisarErroInesperado(evento.reason))
router.onError((erro) => {
  console.error(erro)
  aviso.mostrar('Não foi possível abrir esta tela. Recarregue a página e tente novamente.')
})

app.mount('#app')
