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
        <div class="card-header">
          <h2>Dados do empreendimento</h2>
          <button v-if="!editando" class="btn-link" @click="iniciarEdicao">Editar</button>
        </div>

        <form v-if="editando" class="form-linha" @submit.prevent="handleSalvar">
          <div class="field amplo">
            <label for="nomeEdicao">Nome</label>
            <input id="nomeEdicao" v-model="form.nome" type="text" required />
          </div>

          <div class="field">
            <label for="tipoEdicao">Tipo</label>
            <select id="tipoEdicao" v-model="form.tipo">
              <option v-for="(rotulo, valor) in TIPOS_EMPREENDIMENTO" :key="valor" :value="valor">
                {{ rotulo }}
              </option>
            </select>
          </div>

          <div class="field estreito">
            <label for="pavimentosEdicao">Pavimentos</label>
            <input
              id="pavimentosEdicao"
              v-model.number="form.numPavimentos"
              type="number"
              min="1"
              required
            />
          </div>

          <div class="field amplo">
            <label for="enderecoEdicao">Endereço</label>
            <input id="enderecoEdicao" v-model="form.endereco" type="text" required />
          </div>

          <div class="field">
            <label for="concessionariaEdicao">Concessionária</label>
            <input id="concessionariaEdicao" v-model="form.concessionaria" type="text" required />
          </div>

          <div class="field actions">
            <button type="submit" :disabled="salvando">
              {{ salvando ? 'Salvando...' : 'Salvar' }}
            </button>
            <button
              type="button"
              class="btn-secundario"
              :disabled="salvando"
              @click="cancelarEdicao"
            >
              Cancelar
            </button>
          </div>
        </form>

        <div v-else class="painel em-linha">
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

        <p v-if="erroEdicao" class="msg erro">{{ erroEdicao }}</p>
        <p v-if="sucessoEdicao" class="msg sucesso">{{ sucessoEdicao }}</p>
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

        <component :is="componenteAtivo" v-if="componenteAtivo" :empreendimento="empreendimento" />
      </template>
    </template>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import CalculoPrumada from '@/components/calculos/CalculoPrumada.vue'
import CalculoCaixaGordura from '@/components/calculos/CalculoCaixaGordura.vue'
import CalculoVazaoPredial from '@/components/calculos/CalculoVazaoPredial.vue'
import CalculoTanqueSeptico from '@/components/calculos/CalculoTanqueSeptico.vue'
import * as empreendimentoService from '@/services/empreendimentoService'
import { TIPOS_EMPREENDIMENTO } from '@/constants/opcoes'

const CALCULOS = [
  {
    id: 'prumada',
    nome: 'Prumada de esgoto',
    descricao: 'Configuração normativa de prumada para cozinha ou área de serviço.',
    componente: CalculoPrumada,
  },
  {
    id: 'caixa-gordura',
    nome: 'Caixa de gordura e sabão',
    descricao: 'Volume da caixa a partir da taxa de ocupação e do número de apartamentos.',
    componente: CalculoCaixaGordura,
  },
  {
    id: 'vazao-predial',
    nome: 'Vazão predial',
    descricao: 'Demanda média, máxima diária e máxima horária, com o volume da caixa d’água.',
    componente: CalculoVazaoPredial,
  },
  {
    id: 'tanque-septico',
    nome: 'Tanque séptico',
    descricao: 'Volume útil e dimensões internas, a partir das unidades de contribuição.',
    componente: CalculoTanqueSeptico,
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

const editando = ref(false)
const form = ref({})
const salvando = ref(false)
const erroEdicao = ref('')
const sucessoEdicao = ref('')

const calculoAtivo = ref('')

const abaAtiva = computed(() => (route.query.aba === 'dados' ? 'dados' : 'calculos'))

const componenteAtivo = computed(
  () => CALCULOS.find((calculo) => calculo.id === calculoAtivo.value)?.componente,
)

function trocarAba(aba) {
  router.replace({ query: { ...route.query, aba } })
}

function selecionarCalculo(id) {
  calculoAtivo.value = calculoAtivo.value === id ? '' : id
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

function iniciarEdicao() {
  const { nome, tipo, numPavimentos, endereco, concessionaria } = empreendimento.value
  form.value = { nome, tipo, numPavimentos, endereco, concessionaria }
  erroEdicao.value = ''
  sucessoEdicao.value = ''
  editando.value = true
}

function cancelarEdicao() {
  editando.value = false
  erroEdicao.value = ''
}

async function handleSalvar() {
  erroEdicao.value = ''
  sucessoEdicao.value = ''
  salvando.value = true

  try {
    empreendimento.value = await empreendimentoService.atualizar(props.id, {
      ...form.value,
      empresaId: empreendimento.value.empresaId,
    })
    sucessoEdicao.value = 'Empreendimento atualizado com sucesso.'
    editando.value = false
  } catch (error) {
    erroEdicao.value =
      error.response?.data?.mensagem ?? 'Não foi possível atualizar o empreendimento.'
  } finally {
    salvando.value = false
  }
}

onMounted(async () => {
  await carregarEmpreendimento()
  if (empreendimento.value && route.query.editar === '1') iniciarEdicao()
})
</script>
