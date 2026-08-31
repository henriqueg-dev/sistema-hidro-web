import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authService from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const nome = ref(localStorage.getItem('nome'))
  const email = ref(localStorage.getItem('email'))
  const perfil = ref(localStorage.getItem('perfil'))

  const isAuthenticated = computed(() => !!token.value)

  async function login(emailInformado, senha) {
    const data = await authService.login(emailInformado, senha)

    token.value = data.token
    nome.value = data.nome
    email.value = data.email
    perfil.value = data.perfil

    localStorage.setItem('token', data.token)
    localStorage.setItem('nome', data.nome)
    localStorage.setItem('email', data.email)
    localStorage.setItem('perfil', data.perfil)
  }

  /** Substitui o token pelo que o backend renovou enquanto o usuário estava ativo. */
  function renovarToken(novoToken) {
    token.value = novoToken
    localStorage.setItem('token', novoToken)
  }

  function logout() {
    token.value = null
    nome.value = null
    email.value = null
    perfil.value = null

    localStorage.removeItem('token')
    localStorage.removeItem('nome')
    localStorage.removeItem('email')
    localStorage.removeItem('perfil')
  }

  return { token, nome, email, perfil, isAuthenticated, login, renovarToken, logout }
})
