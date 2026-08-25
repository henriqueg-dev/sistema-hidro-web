import api from '@/services/api'

export function criar(usuario) {
  return api.post('/api/usuarios', usuario).then((response) => response.data)
}

export function listarTodos() {
  return api.get('/api/usuarios').then((response) => response.data)
}

export function alterarMinhaSenha(senhaAtual, novaSenha) {
  return api.patch('/api/usuarios/me/senha', { senhaAtual, novaSenha })
}

export function alterarStatus(id, ativo) {
  return api
    .patch(`/api/usuarios/${id}/status`, null, { params: { ativo } })
    .then((response) => response.data)
}
