import api from '@/services/api'

export function criar(empresa) {
  return api.post('/api/empresas', empresa).then((response) => response.data)
}

export function listarTodas(busca) {
  return api.get('/api/empresas', { params: { busca } }).then((response) => response.data)
}

export function buscarPorId(id) {
  return api.get(`/api/empresas/${id}`).then((response) => response.data)
}

export function atualizar(id, empresa) {
  return api.put(`/api/empresas/${id}`, empresa).then((response) => response.data)
}

export function excluir(id) {
  return api.delete(`/api/empresas/${id}`).then((response) => response.data)
}
