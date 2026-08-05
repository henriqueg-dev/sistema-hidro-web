import api from '@/services/api'

export function criar(empresa) {
  return api.post('/api/empresas', empresa).then((response) => response.data)
}

export function listarTodas() {
  return api.get('/api/empresas').then((response) => response.data)
}

export function buscarPorId(id) {
  return api.get(`/api/empresas/${id}`).then((response) => response.data)
}
