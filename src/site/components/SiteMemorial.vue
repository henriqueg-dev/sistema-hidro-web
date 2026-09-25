<template>
  <!-- Réplica reduzida do PDF gerado pela API (templates/memorial-vazao-predial.html). -->
  <div class="site-memorial" aria-label="Exemplo de memorial de cálculo em PDF" role="img">
    <div class="site-memorial-folha">
      <div class="site-memorial-faixa">
        <small>HIDROS</small>
        <strong>Memorial de cálculo — Vazão predial</strong>
      </div>
      <dl class="site-memorial-cabecalho">
        <div>
          <dt>Cliente</dt>
          <dd>Construtora Aroeira</dd>
        </div>
        <div>
          <dt>Empreendimento</dt>
          <dd>Residencial Ipê</dd>
        </div>
      </dl>

      <h4>1. Dados de entrada</h4>
      <dl class="site-memorial-dados">
        <div v-for="[rotulo, valor] in ENTRADAS" :key="rotulo">
          <dt>{{ rotulo }}</dt>
          <dd>{{ valor }}</dd>
        </div>
      </dl>

      <h4>2. Resultado do dimensionamento</h4>
      <dl class="site-memorial-dados">
        <div v-for="[rotulo, valor] in RESULTADOS" :key="rotulo">
          <dt>{{ rotulo }}</dt>
          <dd>{{ valor }}</dd>
        </div>
      </dl>

      <div class="site-memorial-total">
        <span>Volume total da caixa d’água</span>
        <strong>57,60 m³</strong>
      </div>
    </div>
  </div>
</template>

<script setup>
// Mesmos números da conversa "Conferir a reservação", para o site contar uma história só.
const ENTRADAS = [
  ['Taxa de ocupação', '4 hab/apto'],
  ['Número de apartamentos', '48'],
  ['Consumo per capita', '200 L/hab·dia'],
  ['Capacidade de reserva', '1,5 dia'],
  ['Coeficientes K1 / K2', '1,20 / 1,50'],
]

const RESULTADOS = [
  ['População atendida', '192 hab'],
  ['Reservatório inferior (60%)', '34,56 m³'],
  ['Reservatório superior (40%)', '23,04 m³'],
  ['Vazão média', '0,444 L/s'],
  ['Vazão máxima horária', '0,800 L/s'],
]
</script>
