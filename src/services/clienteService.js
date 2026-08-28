import api from '@/services/api'

export function criar(cliente) {
  return api.post('/api/clientes', cliente).then((response) => response.data)
}

export function listarTodos(busca) {
  return api.get('/api/clientes', { params: { busca } }).then((response) => response.data)
}

export function buscarPorId(id) {
  return api.get(`/api/clientes/${id}`).then((response) => response.data)
}

export function atualizar(id, cliente) {
  return api.put(`/api/clientes/${id}`, cliente).then((response) => response.data)
}

export function excluir(id) {
  return api.delete(`/api/clientes/${id}`).then((response) => response.data)
}
