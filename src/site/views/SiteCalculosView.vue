<template>
  <div>
    <section class="site-topo site-planta">
      <div class="site-container">
        <h1>Cálculos</h1>
        <p>
          Alguns dos dimensionamentos da instalação hidrossanitária disponíveis no sistema, com os
          dados que cada um pede e as verificações da norma feitas antes do resultado. Precisa de
          outro cálculo? <RouterLink :to="{ name: 'site-contato' }">Fale com a gente</RouterLink> e
          podemos adicioná-lo.
        </p>
        <ul class="site-normas">
          <li v-for="norma in NORMAS" :key="norma">{{ norma }}</li>
        </ul>
      </div>
    </section>

    <div class="site-container site-calculos-pagina">
      <nav class="site-indice" aria-label="Índice dos cálculos">
        <div v-for="sistema in SISTEMAS" :key="sistema.id">
          <strong>{{ sistema.nome }}</strong>
          <RouterLink
            v-for="calculo in sistema.calculos"
            :key="calculo.id"
            :to="{ hash: `#${calculo.id}` }"
            :class="{ ativo: ativo === calculo.id }"
          >
            {{ calculo.nome }}
          </RouterLink>
        </div>
      </nav>

      <div class="site-calculos-lista">
        <section
          v-for="sistema in SISTEMAS"
          :key="sistema.id"
          class="site-sistema-bloco"
          :data-rede="sistema.rede"
        >
          <header>
            <h2>{{ sistema.nome }}</h2>
            <p>{{ sistema.resumo }}</p>
          </header>

          <article
            v-for="calculo in sistema.calculos"
            :id="calculo.id"
            :key="calculo.id"
            ref="artigos"
            v-revelar
            class="site-calculo"
          >
            <div class="site-calculo-titulo">
              <h3>{{ calculo.nome }}</h3>
              <span class="site-norma">{{ calculo.norma }}</span>
            </div>
            <p>{{ calculo.resumo }}</p>

            <div class="site-calculo-colunas">
              <div>
                <h4>O que você informa</h4>
                <ul>
                  <li v-for="entrada in calculo.entradas" :key="entrada">{{ entrada }}</li>
                </ul>
              </div>
              <div>
                <h4>O que o sistema confere</h4>
                <ul>
                  <li v-for="item in calculo.verificacoes" :key="item">{{ item }}</li>
                </ul>
              </div>
            </div>
          </article>
        </section>

        <aside class="site-aviso" v-revelar>
          <h2>Os dados de projeto têm uma ordem</h2>
          <p>
            Os formulários chegam preenchidos com os dados do empreendimento, mas cada cálculo salvo
            grava os próprios valores. Assim, uma revisão num cálculo não altera os outros sem você
            ver.
          </p>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import vRevelar from '@/site/diretivas/revelar'
import { SISTEMAS } from '@/site/conteudo/calculos'

const NORMAS = [
  'NBR 5626',
  'NBR 8160',
  'NBR 7229',
  'NBR 13969',
  'NBR 17076',
  'NBR 10339',
  'NBR 14005',
]

const artigos = ref([])
const ativo = ref(SISTEMAS[0].calculos[0].id)
let observador = null

// Marca no índice o cálculo que está na faixa central da tela.
onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') return
  observador = new IntersectionObserver(
    (entradas) => {
      const visivel = entradas.find((entrada) => entrada.isIntersecting)
      if (visivel) ativo.value = visivel.target.id
    },
    { rootMargin: '-35% 0px -60% 0px' },
  )
  artigos.value.forEach((artigo) => observador.observe(artigo))
})

onUnmounted(() => observador?.disconnect())
</script>
