import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authService from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const nome = ref(localStorage.getItem('nome'))
  const perfil = ref(localStorage.getItem('perfil'))

  const isAuthenticated = computed(() => !!token.value)

  async function login(email, senha) {
    const data = await authService.login(email, senha)

    token.value = data.token
    nome.value = data.nome
    perfil.value = data.perfil

    localStorage.setItem('token', data.token)
    localStorage.setItem('nome', data.nome)
    localStorage.setItem('perfil', data.perfil)
  }

  function logout() {
    token.value = null
    nome.value = null
    perfil.value = null

    localStorage.removeItem('token')
    localStorage.removeItem('nome')
    localStorage.removeItem('perfil')
  }

  return { token, nome, perfil, isAuthenticated, login, logout }
})
