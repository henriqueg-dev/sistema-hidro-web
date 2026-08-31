<template>
  <div class="login-page">
    <div class="login-panel">
      <section class="brand-side">
        <div class="brand-content">
          <img
            class="brand-logo"
            src="@/assets/hidros-negativo.png"
            alt="Hidros — Cálculos hidráulicos"
          />
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

          <p v-if="sessaoExpirada" class="msg aviso">
            Sua sessão expirou por inatividade. Entre novamente.
          </p>
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
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const email = ref('')
const senha = ref('')
const erro = ref('')
const carregando = ref(false)

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const sessaoExpirada = computed(() => route.query.expirado === '1' && !erro.value)

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
