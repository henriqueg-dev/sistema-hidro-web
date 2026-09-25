<template>
  <!-- Reprodução da tela do assistente: digita a pergunta, pensa e escreve a resposta, em ciclo. -->
  <div ref="raiz" class="site-conversa">
    <aside class="site-conversa-lista" aria-label="Conversas de exemplo">
      <strong>Conversas</strong>
      <button
        v-for="(conversa, i) in conversas"
        :key="conversa.titulo"
        type="button"
        :class="{ ativa: i === indice }"
        :aria-pressed="i === indice"
        @click="tocar(i)"
      >
        <span>{{ conversa.titulo }}</span>
        <small>{{ conversa.contexto ?? 'Sem contexto de projeto' }}</small>
      </button>
    </aside>

    <div class="site-conversa-chat">
      <header>
        <strong>{{ atual.titulo }}</strong>
        <small>{{
          atual.contexto ? `Contexto: ${atual.contexto}` : 'Sem contexto de projeto'
        }}</small>
      </header>

      <div ref="painel" class="mensagens">
        <div v-if="perguntaEnviada" class="mensagem do-usuario">
          <span>Você</span>
          <p>{{ atual.pergunta }}</p>
        </div>
        <div v-if="pensando" class="mensagem do-assistente">
          <span>Assistente</span>
          <p class="pensando">Pensando...</p>
        </div>
        <div v-if="resposta" class="mensagem do-assistente">
          <span>Assistente</span>
          <p>{{ resposta }}<i v-if="escrevendo" class="site-cursor"></i></p>
        </div>
      </div>

      <div class="site-conversa-envio" aria-hidden="true">
        <div class="site-conversa-campo">
          <template v-if="digitado">{{ digitado }}<i class="site-cursor"></i></template>
          <span v-else>Pergunte sobre dimensionamento e normas</span>
        </div>
        <span class="site-conversa-enviar">Enviar</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  conversas: { type: Array, required: true },
})

const raiz = ref(null)
const painel = ref(null)
const indice = ref(0)
const digitado = ref('')
const perguntaEnviada = ref(false)
const pensando = ref(false)
const resposta = ref('')
const escrevendo = ref(false)

const atual = computed(() => props.conversas[indice.value])

// Cada chamada de tocar() invalida a anterior, que para no próximo passo.
let execucao = 0
let observador = null
const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function rolarParaFim() {
  await nextTick()
  if (painel.value) painel.value.scrollTop = painel.value.scrollHeight
}

async function tocar(i) {
  const id = ++execucao
  const ativa = () => id === execucao
  indice.value = i
  digitado.value = ''
  perguntaEnviada.value = false
  pensando.value = false
  resposta.value = ''
  escrevendo.value = false

  if (semMovimento) {
    perguntaEnviada.value = true
    resposta.value = atual.value.resposta
    return
  }

  await esperar(500)
  for (const letra of atual.value.pergunta) {
    if (!ativa()) return
    digitado.value += letra
    await esperar(32)
  }

  await esperar(450)
  if (!ativa()) return
  digitado.value = ''
  perguntaEnviada.value = true
  pensando.value = true

  await esperar(1400)
  if (!ativa()) return
  pensando.value = false
  escrevendo.value = true
  const texto = atual.value.resposta
  for (let n = 3; n < texto.length + 3; n += 3) {
    if (!ativa()) return
    resposta.value = texto.slice(0, n)
    rolarParaFim()
    await esperar(16)
  }
  escrevendo.value = false

  await esperar(7000)
  if (ativa()) tocar((i + 1) % props.conversas.length)
}

// Só começa quando aparece na tela, para ninguém perder o início.
onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') return tocar(0)
  observador = new IntersectionObserver(
    ([entrada]) => {
      if (!entrada.isIntersecting) return
      observador.disconnect()
      tocar(0)
    },
    { threshold: 0.35 },
  )
  observador.observe(raiz.value)
})

onUnmounted(() => {
  execucao++
  observador?.disconnect()
})
</script>
