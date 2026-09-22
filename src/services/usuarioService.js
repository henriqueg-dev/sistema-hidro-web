import api from '@/services/api'

export function criar(usuario) {
  return api.post('/api/usuarios', usuario).then((response) => response.data)
}

export function listarTodos() {
  return api.get('/api/usuarios').then((response) => response.data)
}

export function solicitarAlteracaoSenha(senhaAtual) {
  return api.post('/api/usuarios/me/senha/codigo', { senhaAtual })
}

export function confirmarAlteracaoSenha(codigo, novaSenha) {
  return api.patch('/api/usuarios/me/senha', { codigo, novaSenha })
}

export function alterarStatus(id, ativo) {
  return api
    .patch(`/api/usuarios/${id}/status`, null, { params: { ativo } })
    .then((response) => response.data)
}

export function reenviarConvite(id) {
  return api.post(`/api/usuarios/${id}/reenviar-convite`)
}
