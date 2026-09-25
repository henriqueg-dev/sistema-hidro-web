import api from '@/services/api'

export function buscar() {
  return api.get('/api/painel').then((response) => response.data)
}
