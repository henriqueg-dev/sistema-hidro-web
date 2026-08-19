import api from '@/services/api'

export function criar(dados) {
  return api.post('/api/caixas-gordura', dados).then((response) => response.data)
}

export function atualizar(id, dados) {
  return api.put(`/api/caixas-gordura/${id}`, dados).then((response) => response.data)
}

export function excluir(id) {
  return api.delete(`/api/caixas-gordura/${id}`).then((response) => response.data)
}

export function listarPorEmpreendimento(empreendimentoId) {
  return api
    .get(`/api/caixas-gordura/empreendimento/${empreendimentoId}`)
    .then((response) => response.data)
}
