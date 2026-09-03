import api from '@/services/api'

export function criar(dados) {
  return api.post('/api/ramais-prediais', dados).then((response) => response.data)
}

export function atualizar(id, dados) {
  return api.put(`/api/ramais-prediais/${id}`, dados).then((response) => response.data)
}

export function excluir(id) {
  return api.delete(`/api/ramais-prediais/${id}`).then((response) => response.data)
}

export function listarPorEmpreendimento(empreendimentoId) {
  return api
    .get(`/api/ramais-prediais/empreendimento/${empreendimentoId}`)
    .then((response) => response.data)
}

export function baixarMemorialPdf(id) {
  return api
    .get(`/api/ramais-prediais/${id}/memorial.pdf`, { responseType: 'blob' })
    .then((response) => response.data)
}
