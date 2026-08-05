import api from '@/services/api'

export function login(email, senha) {
  return api.post('/api/auth/login', { email, senha }).then((response) => response.data)
}
