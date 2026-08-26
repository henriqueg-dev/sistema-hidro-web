import api from '@/services/api'

export function criar(dados) {
  return api.post('/api/tanques-septicos', dados).then((response) => response.data)
}

export function atualizar(id, dados) {
  return api.put(`/api/tanques-septicos/${id}`, dados).then((response) => response.data)
}

export function excluir(id) {
  return api.delete(`/api/tanques-septicos/${id}`).then((response) => response.data)
}

export function listarPorEmpreendimento(empreendimentoId) {
  return api
    .get(`/api/tanques-septicos/empreendimento/${empreendimentoId}`)
    .then((response) => response.data)
}
