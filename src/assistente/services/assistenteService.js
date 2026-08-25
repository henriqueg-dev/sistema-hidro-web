import api from '@/services/api'

export function status() {
  return api.get('/api/assistente/status').then((response) => response.data)
}

export function listarConversas() {
  return api.get('/api/assistente/conversas').then((response) => response.data)
}

export function buscarConversa(id) {
  return api.get(`/api/assistente/conversas/${id}`).then((response) => response.data)
}

export function criarConversa(dados) {
  return api.post('/api/assistente/conversas', dados).then((response) => response.data)
}

export function enviarMensagem(conversaId, dados) {
  return api
    .post(`/api/assistente/conversas/${conversaId}/mensagens`, dados)
    .then((response) => response.data)
}

export function excluirConversa(id) {
  return api.delete(`/api/assistente/conversas/${id}`).then((response) => response.data)
}
