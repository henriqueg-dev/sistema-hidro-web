import api from '@/services/api'

export function criar(dados) {
  return api.post('/api/orcamentos', dados).then((response) => response.data)
}

export function atualizar(id, dados) {
  return api.put(`/api/orcamentos/${id}`, dados).then((response) => response.data)
}

export function excluir(id) {
  return api.delete(`/api/orcamentos/${id}`).then((response) => response.data)
}

export function listarTodos() {
  return api.get('/api/orcamentos').then((response) => response.data)
}

export function baixarPdf(id) {
  return api
    .get(`/api/orcamentos/${id}/orcamento.pdf`, { responseType: 'blob' })
    .then((response) => response.data)
}
