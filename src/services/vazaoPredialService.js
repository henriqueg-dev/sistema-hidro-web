import api from '@/services/api'

export function criar(dados) {
  return api.post('/api/vazoes-prediais', dados).then((response) => response.data)
}

export function atualizar(id, dados) {
  return api.put(`/api/vazoes-prediais/${id}`, dados).then((response) => response.data)
}

export function excluir(id) {
  return api.delete(`/api/vazoes-prediais/${id}`).then((response) => response.data)
}

export function listarPorEmpreendimento(empreendimentoId) {
  return api
    .get(`/api/vazoes-prediais/empreendimento/${empreendimentoId}`)
    .then((response) => response.data)
}
