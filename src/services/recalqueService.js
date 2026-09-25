import api from '@/services/api'

export function criar(dados) {
  return api.post('/api/recalques', dados).then((response) => response.data)
}

export function atualizar(id, dados) {
  return api.put(`/api/recalques/${id}`, dados).then((response) => response.data)
}

export function excluir(id) {
  return api.delete(`/api/recalques/${id}`).then((response) => response.data)
}

export function listarPorEmpreendimento(empreendimentoId) {
  return api
    .get(`/api/recalques/empreendimento/${empreendimentoId}`)
    .then((response) => response.data)
}

export function baixarMemorialPdf(id) {
  return api
    .get(`/api/recalques/${id}/memorial.pdf`, { responseType: 'blob' })
    .then((response) => response.data)
}
