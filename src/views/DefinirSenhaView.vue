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
        <form v-if="fase === 'solicitar'" class="login-card" @submit.prevent="handleSolicitar">
          <h2>Esqueci minha senha</h2>
          <p class="subtitle">Informe seu e-mail para receber um código de verificação.</p>

          <label for="email">E-mail</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="voce@empresa.com"
            required
            autocomplete="username"
          />

          <p v-if="erro" class="msg erro">{{ erro }}</p>

          <button type="submit" :disabled="carregando">
            {{ carregando ? 'Enviando...' : 'Enviar código' }}
          </button>

          <p class="texto-secundario">
            <router-link :to="{ name: 'login' }">Voltar para o login</router-link>
          </p>
        </form>

        <form v-else class="login-card" @submit.prevent="handleDefinir">
          <h2>{{ vindoDeConvite ? 'Aceitar convite' : 'Definir nova senha' }}</h2>
          <p class="subtitle">
            {{
              vindoDeConvite
                ? 'Confira o código enviado por e-mail e crie sua senha de acesso.'
                : 'Informe o código recebido por e-mail e a nova senha.'
            }}
          </p>

          <label for="email-definir">E-mail</label>
          <input id="email-definir" v-model="email" type="email" required autocomplete="username" />

          <label for="codigo">Código</label>
          <input
            id="codigo"
            v-model="codigo"
            type="text"
            inputmode="numeric"
            maxlength="6"
            placeholder="000000"
            required
          />

          <label for="nova-senha">Nova senha</label>
          <input
            id="nova-senha"
            v-model="novaSenha"
            type="password"
            required
            minlength="8"
            autocomplete="new-password"
            placeholder="Mínimo de 8 caracteres"
          />

          <p v-if="erro" class="msg erro">{{ erro }}</p>
          <p v-if="sucesso" class="msg sucesso">{{ sucesso }}</p>
          <p v-if="msgReenvio" class="msg sucesso">{{ msgReenvio }}</p>

          <button type="submit" :disabled="carregando || !!sucesso">
            {{ carregando ? 'Salvando...' : 'Salvar senha' }}
          </button>

          <p v-if="!vindoDeConvite" class="texto-secundario">
            <button type="button" class="btn-link" :disabled="reenviando" @click="handleReenviarCodigo">
              {{ reenviando ? 'Enviando...' : 'Reenviar código' }}
            </button>
          </p>
          <p class="texto-secundario">
            <router-link :to="{ name: 'login' }">Ir para o login</router-link>
          </p>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import * as authService from '@/services/authService'

const route = useRoute()

const vindoDeConvite = !!route.query.codigo
const fase = ref(vindoDeConvite ? 'definir' : 'solicitar')

const email = ref(route.query.email ?? '')
const codigo = ref(route.query.codigo ?? '')
const novaSenha = ref('')
const erro = ref('')
const sucesso = ref('')
const carregando = ref(false)
const reenviando = ref(false)
const msgReenvio = ref('')

async function handleSolicitar() {
  erro.value = ''
  carregando.value = true

  try {
    await authService.esqueciSenha(email.value)
    fase.value = 'definir'
  } catch (error) {
    erro.value = error.response?.data?.mensagem ?? 'Não foi possível enviar o código.'
  } finally {
    carregando.value = false
  }
}

async function handleReenviarCodigo() {
  erro.value = ''
  msgReenvio.value = ''
  reenviando.value = true

  try {
    await authService.esqueciSenha(email.value)
    msgReenvio.value = 'Novo código enviado para o seu e-mail.'
  } catch (error) {
    erro.value = error.response?.data?.mensagem ?? 'Não foi possível reenviar o código.'
  } finally {
    reenviando.value = false
  }
}

async function handleDefinir() {
  erro.value = ''
  sucesso.value = ''
  carregando.value = true

  try {
    await authService.redefinirSenha(email.value, codigo.value, novaSenha.value)
    sucesso.value = 'Senha definida com sucesso. Você já pode entrar.'
  } catch (error) {
    erro.value = error.response?.data?.mensagem ?? 'Código inválido ou expirado.'
  } finally {
    carregando.value = false
  }
}
</script>
