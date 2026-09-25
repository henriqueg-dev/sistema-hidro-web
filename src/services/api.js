import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useAvisoStore } from '@/stores/aviso'
import router from '@/router'

const CABECALHO_RENOVACAO = 'x-token-renovado'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8081',
})

api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    // O backend renova o token enquanto há uso; parado, ele expira por inatividade.
    const renovado = response.headers?.[CABECALHO_RENOVACAO]
    if (renovado) {
      useAuthStore().renovarToken(renovado)
    }
    return response
  },
  (error) => {
    // Em /api/auth, 401/403 é senha ou código errado: a própria tela mostra a mensagem.
    const ehAutenticacao = error.config?.url?.startsWith('/api/auth/')
    const status = error.response?.status

    if (status === 401 && !ehAutenticacao) {
      const authStore = useAuthStore()
      authStore.logout()
      router.push({ name: 'login', query: { expirado: '1' } })
    }
    if (status === 403 && !ehAutenticacao) {
      useAvisoStore().mostrar(
        error.response.data?.mensagem ?? 'Seu perfil não tem permissão para esta ação.',
      )
    }
    if (status === 402 && router.currentRoute.value.name !== 'assinatura') {
      router.push({ name: 'assinatura' })
    }
    return Promise.reject(error)
  },
)

export default api
