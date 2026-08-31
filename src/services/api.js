import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
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
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      router.push({ name: 'login', query: { expirado: '1' } })
    }
    return Promise.reject(error)
  },
)

export default api
