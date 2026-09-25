import api from '@/services/api'

export function listar() {
  return api.get('/api/tabelas-normativas').then((response) => response.data)
}
