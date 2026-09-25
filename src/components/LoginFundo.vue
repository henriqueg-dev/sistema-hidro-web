<template>
  <!-- Planta decorativa atrás do login: a rede corre pelas bordas, fora do painel central. -->
  <svg class="login-fundo" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect class="reservatorio" x="700" y="806" width="64" height="48" rx="4" />
    <rect class="caixa-esgoto" x="850" y="808" width="54" height="44" rx="4" />
    <rect class="peca" x="52" y="214" width="16" height="16" />
    <rect class="peca" x="62" y="600" width="16" height="16" />
    <rect class="peca esgoto" x="1560" y="242" width="16" height="16" />
    <rect class="peca esgoto" x="1560" y="462" width="16" height="16" />
    <rect class="peca esgoto" x="1560" y="642" width="16" height="16" />

    <path
      v-for="tubo in TUBOS"
      :key="tubo.d"
      :class="['tubo', tubo.tipo]"
      :d="tubo.d"
      :style="{ '--atraso': tubo.atraso }"
      pathLength="1"
    />
    <path v-for="tubo in TUBOS" :key="`f${tubo.d}`" :class="['fluxo', tubo.tipo]" :d="tubo.d" />

    <g v-for="(no, i) in NOS" :key="i" :class="['no', no.tipo]" :style="{ '--atraso': `${i * 0.4}s` }">
      <circle class="pulso" :cx="no.x" :cy="no.y" r="7" />
      <circle :cx="no.x" :cy="no.y" r="7" />
    </g>

    <g
      v-for="(leitura, i) in leituras"
      :key="leitura.rotulo"
      class="leitura"
      :transform="`translate(${leitura.x} ${leitura.y})`"
      :style="{ '--atraso': `${1.4 + i * 0.12}s` }"
    >
      <rect width="136" height="48" rx="8" />
      <circle :class="['ao-vivo', leitura.tipo]" cx="14" cy="16" r="3.5" />
      <text class="rotulo" x="24" y="20">{{ leitura.rotulo }}</text>
      <text class="valor" x="12" y="39">{{ formatar(leitura) }}</text>
    </g>
  </svg>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

// Desenhados no sentido do escoamento, para o tracejado correr na direção certa.
const TUBOS = [
  { tipo: 'agua', d: 'M1180 0 V90 H160 V830 H700', atraso: '0s' },
  { tipo: 'agua', d: 'M160 300 H60 V230', atraso: '0.7s' },
  { tipo: 'agua', d: 'M160 520 H70 V600', atraso: '0.9s' },
  { tipo: 'esgoto', d: 'M1568 250 H1440', atraso: '0.8s' },
  { tipo: 'esgoto', d: 'M1568 470 H1440', atraso: '1s' },
  { tipo: 'esgoto', d: 'M1568 650 H1440', atraso: '1.2s' },
  { tipo: 'esgoto', d: 'M1440 0 V830 H904', atraso: '0.3s' },
]

const NOS = [
  { tipo: 'agua', x: 1180, y: 90 },
  { tipo: 'agua', x: 160, y: 300 },
  { tipo: 'agua', x: 160, y: 520 },
  { tipo: 'agua', x: 160, y: 830 },
  { tipo: 'esgoto', x: 1440, y: 250 },
  { tipo: 'esgoto', x: 1440, y: 470 },
  { tipo: 'esgoto', x: 1440, y: 650 },
  { tipo: 'esgoto', x: 1440, y: 830 },
]

// Valores plausíveis de um prédio residencial; oscilam em torno da base.
const BASE = [
  { tipo: 'agua', rotulo: 'Vazão · Q', unidade: 'L/s', base: 1.84, variacao: 0.06, casas: 2, x: 1196, y: 18 },
  { tipo: 'agua', rotulo: 'Pressão · nó 1', unidade: 'mca', base: 3.4, variacao: 0.12, casas: 2, x: 520, y: 18 },
  { tipo: 'agua', rotulo: 'Pressão · nó 2', unidade: 'mca', base: 6.1, variacao: 0.15, casas: 2, x: 8, y: 330 },
  { tipo: 'agua', rotulo: 'Velocidade · v', unidade: 'm/s', base: 1.12, variacao: 0.05, casas: 2, x: 8, y: 648 },
  { tipo: 'agua', rotulo: 'Perda · Hf', unidade: 'mca', base: 0.38, variacao: 0.02, casas: 3, x: 380, y: 846 },
  { tipo: 'esgoto', rotulo: 'Ramal · UHC', unidade: 'UHC', base: 24, variacao: 0, casas: 0, x: 1448, y: 272 },
  { tipo: 'esgoto', rotulo: 'Tubo de queda', unidade: 'L/s', base: 2.6, variacao: 0.1, casas: 2, x: 1448, y: 492 },
  { tipo: 'esgoto', rotulo: 'Declividade · i', unidade: '%', base: 2, variacao: 0, casas: 1, x: 1448, y: 672 },
  { tipo: 'esgoto', rotulo: 'Volume útil', unidade: 'm³', base: 2.45, variacao: 0.03, casas: 2, x: 1010, y: 846 },
]

const leituras = ref(BASE.map((l) => ({ ...l, valor: l.base })))
let intervalo = null

function formatar({ valor, casas, unidade }) {
  const numero = valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })
  return `${numero} ${unidade}`
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  intervalo = setInterval(() => {
    leituras.value = BASE.map((l) => ({ ...l, valor: l.base + (Math.random() * 2 - 1) * l.variacao }))
  }, 1600)
})

onUnmounted(() => clearInterval(intervalo))
</script>
