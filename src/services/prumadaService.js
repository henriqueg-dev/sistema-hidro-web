import api from '@/services/api'

export function consultar(filtros) {
  return api.post('/api/prumadas/consultar', filtros).then((response) => response.data)
}

export function listarPorTipo(tipo) {
  return api.get('/api/prumadas', { params: { tipo } }).then((response) => response.data)
}
