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
  } catch {
    erro.value = 'E-mail ou senha inválidos.'
  } finally {
    carregando.value = false
  }
}
</script>

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
          <p>Cálculos hidráulicos prediais com precisão normativa, do jeito que o seu escritório precisa.</p>
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

          <p v-if="erro" class="erro">{{ erro }}</p>

          <button type="submit" :disabled="carregando">
            {{ carregando ? 'Entrando...' : 'Entrar' }}
          </button>

          <p class="hint">
            Ainda não tem conta? Peça para um administrador criar seu acesso no sistema.
          </p>
        </form>
      </section>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1.5rem;
  background: radial-gradient(circle at top left, #e0eaff 0%, var(--color-bg) 55%);
}

.login-panel {
  display: flex;
  width: 100%;
  max-width: 880px;
  min-height: 520px;
  background: var(--color-surface);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.brand-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2.5rem;
  background: linear-gradient(160deg, var(--color-primary) 0%, #1e3a8a 100%);
  color: #fff;
}

.brand-content {
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.brand-logo {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 14px;
}

.brand-logo svg {
  width: 26px;
  height: 26px;
}

.brand-content h1 {
  font-size: 1.75rem;
  font-weight: 700;
}

.brand-content p {
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.85);
}

.form-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2.5rem;
}

.login-card {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
  max-width: 320px;
}

.login-card h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text);
}

.subtitle {
  margin: 0 0 1.25rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.35rem;
}

input {
  padding: 0.65rem 0.85rem;
  margin-bottom: 1rem;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.95rem;
  color: var(--color-text);
  background: var(--color-bg);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
  background: var(--color-surface);
}

.erro {
  color: var(--color-danger);
  background: var(--color-danger-light);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  margin: 0 0 0.75rem;
}

button {
  padding: 0.7rem;
  border: none;
  border-radius: 8px;
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.05s ease;
}

button:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

button:active:not(:disabled) {
  transform: scale(0.99);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hint {
  margin-top: 1.25rem;
  font-size: 0.82rem;
  color: var(--color-text-muted);
  text-align: center;
}

@media (max-width: 720px) {
  .login-panel {
    flex-direction: column;
    min-height: unset;
  }

  .brand-side {
    padding: 2rem;
  }

  .brand-content {
    max-width: none;
  }
}
</style>
