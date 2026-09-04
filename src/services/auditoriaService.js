import api from '@/services/api'

export function linhaDoTempo(busca) {
  return api.get('/api/auditoria', { params: { busca } }).then((response) => response.data)
}

export function historico(entidade, id) {
  return api.get(`/api/auditoria/${entidade}/${id}`).then((response) => response.data)
}
