import api from '@/services/api'

export function referencias() {
  return api.get('/api/piscinas/referencias').then((response) => response.data)
}

export function listarPorEmpreendimento(empreendimentoId) {
  return api
    .get(`/api/piscinas/empreendimento/${empreendimentoId}`)
    .then((response) => response.data)
}

export function criar(dados) {
  return api.post('/api/piscinas', dados).then((response) => response.data)
}

export function atualizar(id, dados) {
  return api.put(`/api/piscinas/${id}`, dados).then((response) => response.data)
}

export function excluir(id) {
  return api.delete(`/api/piscinas/${id}`).then((response) => response.data)
}

export function baixarMemorialPdf(id) {
  return api
    .get(`/api/piscinas/${id}/memorial.pdf`, { responseType: 'blob' })
    .then((response) => response.data)
}
