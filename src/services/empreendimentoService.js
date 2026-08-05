import api from '@/services/api'

export function criar(empreendimento) {
  return api.post('/api/empreendimentos', empreendimento).then((response) => response.data)
}

export function listarPorEmpresa(empresaId) {
  return api.get(`/api/empreendimentos/empresa/${empresaId}`).then((response) => response.data)
}
