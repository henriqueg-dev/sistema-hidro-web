<template>
  <!-- Corte esquemático: cada peça desenhada é um cálculo do sistema e leva à explicação dele. -->
  <figure class="site-diagrama">
    <svg viewBox="0 0 600 512" role="img" aria-labelledby="site-diagrama-titulo">
      <title id="site-diagrama-titulo">
        Corte de um prédio com as partes da instalação que o Hidros calcula: reservatórios,
        recalque, ramal predial, piscina, prumada de esgoto, caixa de gordura, tanque séptico e
        sumidouro.
      </title>

      <rect class="subsolo" x="0" y="400" width="600" height="112" />
      <line class="solo" x1="0" y1="400" x2="600" y2="400" />

      <rect class="predio" x="180" y="110" width="220" height="290" />
      <line class="laje" x1="180" y1="182" x2="400" y2="182" />
      <line class="laje" x1="180" y1="254" x2="400" y2="254" />
      <line class="laje" x1="180" y1="326" x2="400" y2="326" />

      <rect class="reservatorio" x="340" y="58" width="52" height="52" />
      <rect class="reservatorio" x="320" y="414" width="64" height="36" />
      <rect class="piscina" x="430" y="400" width="124" height="24" />
      <path class="piscina-onda" d="M436 407 q8 -4 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0" />

      <path class="tubo agua" pathLength="1" d="M600 440 H384" />
      <path class="tubo agua" pathLength="1" d="M372 414 V110" style="--atraso: 0.6s" />
      <path class="tubo esgoto" pathLength="1" d="M220 90 V440 H170" style="--atraso: 0.3s" />
      <path class="tubo esgoto ramal" pathLength="1" d="M220 166 H268" style="--atraso: 0.9s" />
      <path class="tubo esgoto ramal" pathLength="1" d="M220 238 H296" style="--atraso: 1s" />
      <path class="tubo esgoto ramal" pathLength="1" d="M220 310 H280" style="--atraso: 1.1s" />
      <path class="tubo esgoto ramal" pathLength="1" d="M220 382 H288" style="--atraso: 1.2s" />
      <path class="tubo esgoto" pathLength="1" d="M138 440 H122" style="--atraso: 1.1s" />
      <path class="tubo esgoto" pathLength="1" d="M66 440 H50" style="--atraso: 1.2s" />

      <!-- Sentido do escoamento, animado por cima dos tubos depois que eles se desenham. -->
      <path class="fluxo agua" d="M600 440 H384" />
      <path class="fluxo agua" d="M372 414 V110" />
      <path class="fluxo esgoto" d="M220 120 V440 H170" />
      <path class="fluxo esgoto" d="M138 440 H122" />
      <path class="fluxo esgoto" d="M66 440 H50" />

      <circle class="bomba" cx="372" cy="386" r="8" />
      <circle class="bomba" cx="575" cy="440" r="9" />
      <rect class="caixa-esgoto" x="138" y="426" width="32" height="28" />
      <rect class="caixa-esgoto" x="66" y="418" width="56" height="44" />
      <rect class="sumidouro" x="16" y="412" width="34" height="78" />

      <g class="rotulos">
        <line class="guia" x1="378" y1="296" x2="406" y2="296" />
        <line class="guia" x1="575" y1="449" x2="575" y2="462" />
        <line class="guia" x1="154" y1="424" x2="154" y2="397" />

        <RouterLink
          v-for="rotulo in ROTULOS"
          :key="rotulo.texto"
          v-slot="{ href, navigate }"
          :to="{ name: 'site-calculos', hash: `#${rotulo.calculo}` }"
          custom
        >
          <a :href="href" class="rotulo-link" @click="navigate">
            <text :x="rotulo.x" :y="rotulo.y" :text-anchor="rotulo.ancora">{{ rotulo.texto }}</text>
          </a>
        </RouterLink>
      </g>
    </svg>

    <figcaption class="site-legenda">
      <span class="site-legenda-agua">Água fria</span>
      <span class="site-legenda-esgoto">Esgoto sanitário</span>
    </figcaption>
  </figure>
</template>

<script setup>
const ROTULOS = [
  { texto: 'Vazão predial', calculo: 'vazao-predial', x: 402, y: 90, ancora: 'start' },
  { texto: 'Prumada de esgoto', calculo: 'prumada', x: 206, y: 100, ancora: 'end' },
  { texto: 'Recalque', calculo: 'recalque', x: 412, y: 301, ancora: 'start' },
  { texto: 'Piscina', calculo: 'piscina', x: 492, y: 390, ancora: 'middle' },
  { texto: 'Ramal predial e hidrômetro', calculo: 'ramal-predial', x: 596, y: 478, ancora: 'end' },
  { texto: 'Caixa de gordura', calculo: 'caixa-gordura', x: 172, y: 390, ancora: 'end' },
  { texto: 'Tanque séptico', calculo: 'tanque-septico', x: 108, y: 484, ancora: 'middle' },
  { texto: 'Sumidouro', calculo: 'sumidouro', x: 8, y: 508, ancora: 'start' },
]
</script>
