import api from '@/services/api'

export function criar(dados) {
  return api.post('/api/sumidouros', dados).then((response) => response.data)
}

export function atualizar(id, dados) {
  return api.put(`/api/sumidouros/${id}`, dados).then((response) => response.data)
}

export function excluir(id) {
  return api.delete(`/api/sumidouros/${id}`).then((response) => response.data)
}

export function listarPorEmpreendimento(empreendimentoId) {
  return api
    .get(`/api/sumidouros/empreendimento/${empreendimentoId}`)
    .then((response) => response.data)
}

export function baixarMemorialPdf(id) {
  return api
    .get(`/api/sumidouros/${id}/memorial.pdf`, { responseType: 'blob' })
    .then((response) => response.data)
}
