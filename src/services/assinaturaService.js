import api from '@/services/api'

export function statusAtual() {
  return api.get('/api/assinatura').then((response) => response.data)
}

export function gerarCobranca(plano) {
  return api.post('/api/assinatura/gerar-cobranca', { plano }).then((response) => response.data)
}
