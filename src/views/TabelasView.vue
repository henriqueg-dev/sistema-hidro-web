<template>
  <AppLayout title="Tabelas normativas">
    <p class="subtitle">
      Tabelas e parâmetros que os cálculos do sistema usam, lidos das mesmas constantes do cálculo.
      Cada tabela indica a norma de origem e em quais cálculos entra.
    </p>

    <section class="card">
      <div class="card-header">
        <div class="card-header-titulo">
          <h2>Consultar</h2>
          <p class="subtitle">Filtre pelo nome da tabela, pela norma ou por um valor.</p>
        </div>

        <div class="filtro-grupo">
          <input
            v-model="busca"
            type="search"
            class="campo-busca"
            placeholder="Ex.: joelho, DN 75, hidrômetro..."
            aria-label="Buscar tabela ou valor"
          />
          <select v-model="grupoSelecionado" aria-label="Filtrar por norma">
            <option value="">Todas as normas</option>
            <option v-for="grupo in grupos" :key="grupo.nome" :value="grupo.nome">
              {{ grupo.nome }}
            </option>
          </select>
        </div>
      </div>

      <p v-if="erro" class="msg erro">{{ erro }}</p>
      <p v-else-if="carregando" class="subtitle">Carregando...</p>
      <p v-else-if="!gruposFiltrados.length" class="subtitle">
        Nenhuma tabela encontrada para "{{ busca }}".
      </p>
      <p v-else class="subtitle">
        {{ totalFiltrado }} de {{ tabelas.length }} tabelas.
      </p>
    </section>

    <section v-for="grupo in gruposFiltrados" :key="grupo.nome" class="card">
      <h2>{{ grupo.nome }}</h2>

      <details
        v-for="tabela in grupo.tabelas"
        :key="tabela.titulo"
        class="bloco-tabela"
        :open="!!termo"
      >
        <summary>{{ tabela.titulo }}</summary>
        <p class="subtitle">
          Fonte: {{ tabela.fonte }} ·
          {{ tabela.usadaEm.length ? `Usada em: ${tabela.usadaEm.join(', ')}` : 'Apenas consulta' }}
        </p>

        <div class="tabela-rolagem">
          <table class="tabela">
            <thead>
              <tr>
                <th v-for="coluna in tabela.colunas" :key="coluna">{{ coluna }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(linha, i) in tabela.linhas" :key="i">
                <td v-for="(celula, j) in linha" :key="j">{{ celula }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-if="tabela.nota" class="calculo-nota">{{ tabela.nota }}</p>
      </details>
    </section>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import * as tabelaNormativaService from '@/services/tabelaNormativaService'

const tabelas = ref([])
const carregando = ref(true)
const erro = ref('')
const busca = ref('')
const grupoSelecionado = ref('')

// Busca sem acento e sem caixa: "hidrometro" acha "Hidrômetro".
function normalizar(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

const termo = computed(() => normalizar(busca.value.trim()))

// Grupos na ordem em que a API os envia.
const grupos = computed(() => {
  const mapa = new Map()
  for (const tabela of tabelas.value) {
    if (!mapa.has(tabela.grupo)) mapa.set(tabela.grupo, { nome: tabela.grupo, tabelas: [] })
    mapa.get(tabela.grupo).tabelas.push(tabela)
  }
  return [...mapa.values()]
})

function atende(tabela) {
  if (!termo.value) return true
  const conteudo = [
    tabela.grupo,
    tabela.titulo,
    tabela.fonte,
    tabela.nota ?? '',
    ...tabela.usadaEm,
    ...tabela.colunas,
    ...tabela.linhas.flat(),
  ]
  return conteudo.some((texto) => normalizar(texto).includes(termo.value))
}

const gruposFiltrados = computed(() =>
  grupos.value
    .filter((grupo) => !grupoSelecionado.value || grupo.nome === grupoSelecionado.value)
    .map((grupo) => ({ ...grupo, tabelas: grupo.tabelas.filter(atende) }))
    .filter((grupo) => grupo.tabelas.length),
)

const totalFiltrado = computed(() =>
  gruposFiltrados.value.reduce((total, grupo) => total + grupo.tabelas.length, 0),
)

onMounted(async () => {
  try {
    tabelas.value = await tabelaNormativaService.listar()
  } catch {
    erro.value = 'Não foi possível carregar as tabelas normativas.'
  } finally {
    carregando.value = false
  }
})
</script>
