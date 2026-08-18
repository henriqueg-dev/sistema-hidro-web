<template>
  <AppLayout>
    <RouterLink
      v-if="empreendimento"
      class="voltar"
      :to="{ name: 'empresa-detalhe', params: { id: empreendimento.empresaId } }"
    >
      &larr; {{ empreendimento.empresaNome }}
    </RouterLink>
    <RouterLink v-else class="voltar" to="/empresas">&larr; Empresas</RouterLink>

    <h1 class="page-title">{{ empreendimento?.nome ?? 'Empreendimento' }}</h1>

    <p v-if="carregando" class="subtitle">Carregando...</p>
    <p v-else-if="erroEmpreendimento" class="msg erro">{{ erroEmpreendimento }}</p>

    <template v-else-if="empreendimento">
      <nav class="abas">
        <button
          type="button"
          class="aba"
          :class="{ ativa: abaAtiva === 'calculos' }"
          @click="trocarAba('calculos')"
        >
          Cálculos
        </button>
        <button
          type="button"
          class="aba"
          :class="{ ativa: abaAtiva === 'dados' }"
          @click="trocarAba('dados')"
        >
          Dados
        </button>
      </nav>

      <section v-if="abaAtiva === 'dados'" class="card">
        <h2>Dados do empreendimento</h2>

        <div class="painel em-linha">
          <div class="painel-item">
            <span>Nome</span>
            <strong>{{ empreendimento.nome }}</strong>
          </div>
          <div class="painel-item">
            <span>Tipo</span>
            <strong>{{ TIPOS_EMPREENDIMENTO[empreendimento.tipo] ?? empreendimento.tipo }}</strong>
          </div>
          <div class="painel-item estreito">
            <span>Pavimentos</span>
            <strong>{{ empreendimento.numPavimentos }}</strong>
          </div>
          <div class="painel-item">
            <span>Concessionária</span>
            <strong>{{ empreendimento.concessionaria }}</strong>
          </div>
          <div class="painel-item">
            <span>Empresa</span>
            <strong>{{ empreendimento.empresaNome }}</strong>
          </div>
          <div class="painel-item amplo">
            <span>Endereço</span>
            <strong>{{ empreendimento.endereco }}</strong>
          </div>
        </div>
      </section>

      <template v-else>
        <section class="card">
          <h2>Cálculos disponíveis</h2>
          <p class="subtitle">
            Escolha um cálculo para executar sobre {{ empreendimento.nome }} ({{
              empreendimento.numPavimentos
            }}
            pavimentos).
          </p>

          <div class="grade-calculos">
            <button
              v-for="calculo in CALCULOS"
              :key="calculo.id"
              type="button"
              class="calculo-item"
              :class="{ ativo: calculoAtivo === calculo.id }"
              @click="selecionarCalculo(calculo.id)"
            >
              <strong>{{ calculo.nome }}</strong>
              <span>{{ calculo.descricao }}</span>
            </button>
          </div>
        </section>

        <section v-if="calculoAtivo === 'prumada'" class="card">
          <h2>Prumada de esgoto</h2>
          <p class="subtitle">
            O número de pavimentos vem do empreendimento e define a faixa normativa aplicada.
          </p>

          <form class="form-linha" @submit.prevent="handleConsultarPrumada">
            <div class="field amplo">
              <label for="tipo">Tipo</label>
              <select id="tipo" v-model="prumadaForm.tipo">
                <option v-for="(rotulo, valor) in TIPOS_PRUMADA" :key="valor" :value="valor">
                  {{ rotulo }}
                </option>
              </select>
            </div>

            <div class="field estreito">
              <label for="numPavimentos">Pavimentos</label>
              <input
                id="numPavimentos"
                :value="empreendimento.numPavimentos"
                type="number"
                disabled
              />
            </div>

            <div class="field">
              <label for="desconector">Desconector</label>
              <select id="desconector" v-model="prumadaForm.desconector">
                <option v-for="(rotulo, valor) in DESCONECTORES" :key="valor" :value="valor">
                  {{ rotulo }}
                </option>
              </select>
            </div>

            <div class="field amplo">
              <label for="condicaoSanca">Condição da sanca</label>
              <select id="condicaoSanca" v-model="prumadaForm.condicaoSanca">
                <option v-for="(rotulo, valor) in CONDICOES_SANCA" :key="valor" :value="valor">
                  {{ rotulo }}
                </option>
              </select>
            </div>

            <div class="field actions">
              <button type="submit" :disabled="consultando">
                {{ consultando ? 'Calculando...' : 'Calcular' }}
              </button>
            </div>
          </form>

          <p v-if="erroPrumada" class="msg erro">{{ erroPrumada }}</p>

          <div v-if="resultadoPrumada" class="painel">
            <div class="painel-item">
              <span>Tipo</span>
              <strong>{{ resultadoPrumada.tipo }}</strong>
            </div>
            <div class="painel-item">
              <span>Faixa de pavimentos</span>
              <strong>{{ resultadoPrumada.numPavimentos }}</strong>
            </div>
            <div class="painel-item">
              <span>Desconector</span>
              <strong>{{ resultadoPrumada.desconector }}</strong>
            </div>
            <div class="painel-item">
              <span>Condição da sanca</span>
              <strong>{{ resultadoPrumada.condicaoSanca }}</strong>
            </div>
            <div class="painel-item full">
              <span>Descrição</span>
              <p>{{ resultadoPrumada.descricao }}</p>
            </div>
          </div>
        </section>
      </template>
    </template>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import * as empreendimentoService from '@/services/empreendimentoService'
import * as prumadaService from '@/services/prumadaService'
import {
  CONDICOES_SANCA,
  DESCONECTORES,
  TIPOS_EMPREENDIMENTO,
  TIPOS_PRUMADA,
} from '@/constants/opcoes'

const CALCULOS = [
  {
    id: 'prumada',
    nome: 'Prumada de esgoto',
    descricao: 'Configuração normativa de prumada para cozinha ou área de serviço.',
  },
]

const props = defineProps({
  id: { type: String, required: true },
})

const route = useRoute()
const router = useRouter()

const empreendimento = ref(null)
const carregando = ref(true)
const erroEmpreendimento = ref('')

const calculoAtivo = ref('')

const prumadaForm = ref({
  tipo: 'COZINHA',
  desconector: '50mm',
  condicaoSanca: 'SEM_SANCA',
})
const consultando = ref(false)
const erroPrumada = ref('')
const resultadoPrumada = ref(null)

const abaAtiva = computed(() => (route.query.aba === 'dados' ? 'dados' : 'calculos'))

function trocarAba(aba) {
  router.replace({ query: { ...route.query, aba } })
}

function selecionarCalculo(id) {
  calculoAtivo.value = calculoAtivo.value === id ? '' : id
  erroPrumada.value = ''
  resultadoPrumada.value = null
}

async function carregarEmpreendimento() {
  carregando.value = true
  try {
    empreendimento.value = await empreendimentoService.buscarPorId(props.id)
  } catch (error) {
    erroEmpreendimento.value =
      error.response?.status === 404
        ? 'Empreendimento não encontrado.'
        : 'Não foi possível carregar o empreendimento.'
  } finally {
    carregando.value = false
  }
}

async function handleConsultarPrumada() {
  erroPrumada.value = ''
  resultadoPrumada.value = null
  consultando.value = true

  try {
    resultadoPrumada.value = await prumadaService.consultar({
      ...prumadaForm.value,
      numPavimentos: empreendimento.value.numPavimentos,
    })
  } catch (error) {
    erroPrumada.value =
      error.response?.data?.mensagem ??
      'Nenhuma configuração encontrada para os parâmetros informados.'
  } finally {
    consultando.value = false
  }
}

onMounted(carregarEmpreendimento)
</script>
