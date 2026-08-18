<template>
  <div class="login-page">
    <div class="login-panel">
      <section class="brand-side">
        <div class="brand-content">
          <div class="brand-logo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C12 2 5 10.5 5 15.5C5 19.6421 8.35786 23 12.5 23C16.6421 23 20 19.6421 20 15.5C20 10.9 15 4.8 12 2Z"
                fill="white"
                fill-opacity="0.9"
              />
            </svg>
          </div>
          <h1>Sistema Hidro</h1>
          <p>
            Cálculos hidráulicos prediais com precisão normativa, do jeito que o seu escritório
            precisa.
          </p>
        </div>
      </section>

      <section class="form-side">
        <form class="login-card" @submit.prevent="handleSubmit">
          <h2>Bem-vindo(a) de volta</h2>
          <p class="subtitle">Entre com suas credenciais para continuar</p>

          <label for="email">E-mail</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="voce@empresa.com"
            required
            autocomplete="username"
          />

          <label for="senha">Senha</label>
          <input
            id="senha"
            v-model="senha"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />

          <p v-if="erro" class="msg erro">{{ erro }}</p>

          <button type="submit" :disabled="carregando">
            {{ carregando ? 'Entrando...' : 'Entrar' }}
          </button>

          <p class="texto-secundario">
            Ainda não tem conta? Peça para um administrador criar seu acesso no sistema.
          </p>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const email = ref('')
const senha = ref('')
const erro = ref('')
const carregando = ref(false)

const authStore = useAuthStore()
const router = useRouter()

async function handleSubmit() {
  erro.value = ''
  carregando.value = true

  try {
    await authStore.login(email.value, senha.value)
    router.push({ name: 'home' })
  } catch (error) {
    erro.value = error.response?.data?.mensagem ?? 'E-mail ou senha inválidos.'
  } finally {
    carregando.value = false
  }
}
</script>
