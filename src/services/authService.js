import api from '@/services/api'

export function login(email, senha) {
  return api.post('/api/auth/login', { email, senha }).then((response) => response.data)
}

export function esqueciSenha(email) {
  return api.post('/api/auth/esqueci-senha', { email })
}

export function redefinirSenha(email, codigo, novaSenha) {
  return api.post('/api/auth/redefinir-senha', { email, codigo, novaSenha })
}
