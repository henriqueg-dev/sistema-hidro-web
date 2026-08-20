import api from '@/services/api'

export function criar(empreendimento) {
  return api.post('/api/empreendimentos', empreendimento).then((response) => response.data)
}

export function listarPorEmpresa(empresaId) {
  return api.get(`/api/empreendimentos/empresa/${empresaId}`).then((response) => response.data)
}

export function buscarPorId(id) {
  return api.get(`/api/empreendimentos/${id}`).then((response) => response.data)
}

export function excluir(id) {
  return api.delete(`/api/empreendimentos/${id}`).then((response) => response.data)
}

export function atualizar(id, empreendimento) {
  return api.put(`/api/empreendimentos/${id}`, empreendimento).then((response) => response.data)
}
