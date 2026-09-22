import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authService from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const nome = ref(localStorage.getItem('nome'))
  const email = ref(localStorage.getItem('email'))
  const perfil = ref(localStorage.getItem('perfil'))
  const nomeEscritorio = ref(localStorage.getItem('nomeEscritorio'))

  const isAuthenticated = computed(() => !!token.value)

  async function login(emailInformado, senha) {
    aplicarSessao(await authService.login(emailInformado, senha))
  }

  function aplicarSessao(data) {
    token.value = data.token
    nome.value = data.nome
    email.value = data.email
    perfil.value = data.perfil
    nomeEscritorio.value = data.nomeEscritorio

    localStorage.setItem('token', data.token)
    localStorage.setItem('nome', data.nome)
    localStorage.setItem('email', data.email)
    localStorage.setItem('perfil', data.perfil)
    localStorage.setItem('nomeEscritorio', data.nomeEscritorio ?? '')
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
    nomeEscritorio.value = null

    localStorage.removeItem('token')
    localStorage.removeItem('nome')
    localStorage.removeItem('email')
    localStorage.removeItem('perfil')
    localStorage.removeItem('nomeEscritorio')
  }

  return {
    token,
    nome,
    email,
    perfil,
    nomeEscritorio,
    isAuthenticated,
    login,
    renovarToken,
    logout,
  }
})
