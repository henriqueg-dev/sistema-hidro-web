<template>
  <strong ref="elemento">{{ atual }}</strong>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

// Conta de zero até o valor quando o número aparece na tela.
const props = defineProps({
  valor: { type: Number, required: true },
})

const elemento = ref(null)
const atual = ref(props.valor)
let observador = null

function animar() {
  const inicio = performance.now()
  const duracao = 1200
  const passo = (agora) => {
    const progresso = Math.min((agora - inicio) / duracao, 1)
    atual.value = Math.round(props.valor * (1 - (1 - progresso) ** 3))
    if (progresso < 1) requestAnimationFrame(passo)
  }
  requestAnimationFrame(passo)
}

onMounted(() => {
  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (semMovimento || typeof IntersectionObserver === 'undefined') return
  atual.value = 0
  observador = new IntersectionObserver(([entrada]) => {
    if (!entrada.isIntersecting) return
    observador.disconnect()
    animar()
  })
  observador.observe(elemento.value)
})

onUnmounted(() => observador?.disconnect())
</script>
