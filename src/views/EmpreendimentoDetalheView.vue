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

        <section v-if="calculoAtivo === 'caixa-gordura'" class="card">
          <h2>Caixa de gordura e sabão</h2>
          <p class="subtitle">
            Volume calculado pela população atendida (taxa de ocupação &times; número de
            apartamentos). Até {{ MAX_CAIXAS_GORDURA }} cálculos por empreendimento.
          </p>

          <p v-if="carregandoCaixasGordura" class="subtitle">Carregando cálculos...</p>

          <div v-else-if="caixasGordura.length" class="lista-calculos">
            <article
              v-for="(caixa, indice) in caixasGordura"
              :key="caixa.id"
              class="calculo-registro"
              :class="{ 'em-edicao': caixaGorduraForm.id === caixa.id }"
            >
              <header>
                <span class="badge">Cálculo {{ indice + 1 }}</span>

                <span v-if="caixaGorduraParaRemover === caixa.id" class="confirmacao">
                  <span>Remover este cálculo?</span>
                  <button
                    type="button"
                    class="btn-link perigo"
                    :disabled="removendoCaixaGordura"
                    @click="handleRemoverCaixaGordura(caixa)"
                  >
                    {{ removendoCaixaGordura ? 'Removendo...' : 'Sim, remover' }}
                  </button>
                  <button type="button" class="btn-link" @click="caixaGorduraParaRemover = null">
                    Cancelar
                  </button>
                </span>

                <span v-else class="confirmacao">
                  <button type="button" class="btn-link" @click="editarCaixaGordura(caixa)">
                    Alterar
                  </button>
                  <button
                    type="button"
                    class="btn-link perigo"
                    @click="caixaGorduraParaRemover = caixa.id"
                  >
                    Remover
                  </button>
                </span>
              </header>

              <div class="calculo-corpo">
                <div class="calculo-destaque">
                  <span>Volume da caixa (Vc)</span>
                  <strong>{{ caixa.volumeLitros }} L</strong>
                  <small>{{ caixa.formula }}</small>
                </div>

                <dl class="calculo-dados">
                  <div>
                    <dt>Taxa de ocupação</dt>
                    <dd>{{ caixa.taxaOcupacao }} hab/apto</dd>
                  </div>
                  <div>
                    <dt>Apartamentos</dt>
                    <dd>{{ caixa.numApartamentos }}</dd>
                  </div>
                  <div>
                    <dt>População (N)</dt>
                    <dd>{{ caixa.populacao }} hab</dd>
                  </div>
                </dl>
              </div>
            </article>

            <button
              v-if="!formCaixaGorduraAberto && podeAdicionarCaixaGordura"
              type="button"
              class="calculo-adicionar"
              @click="novoCaixaGordura"
            >
              <strong>+ Novo cálculo</strong>
              <span>Registre o segundo cálculo deste empreendimento.</span>
            </button>
          </div>

          <div v-else-if="!formCaixaGorduraAberto" class="estado-vazio">
            <strong>Nenhum cálculo registrado</strong>
            <span
              >Cadastre o primeiro cálculo de caixa de gordura e sabão deste empreendimento.</span
            >
            <button type="button" @click="novoCaixaGordura">Novo cálculo</button>
          </div>

          <div v-if="formCaixaGorduraAberto" class="form-destaque">
            <h3>{{ tituloFormCaixaGordura }}</h3>

            <form class="form-linha" @submit.prevent="handleSalvarCaixaGordura">
              <div class="field estreito">
                <label for="taxaOcupacao">Taxa de ocupação (hab/apto)</label>
                <input
                  id="taxaOcupacao"
                  v-model.number="caixaGorduraForm.taxaOcupacao"
                  type="number"
                  min="1"
                />
              </div>

              <div class="field estreito">
                <label for="numApartamentos">Número de apartamentos</label>
                <input
                  id="numApartamentos"
                  v-model.number="caixaGorduraForm.numApartamentos"
                  type="number"
                  min="1"
                />
              </div>

              <div class="field actions">
                <button type="submit" :disabled="salvandoCaixaGordura">
                  {{ salvandoCaixaGordura ? 'Calculando...' : 'Calcular' }}
                </button>
                <button type="button" class="btn-secundario" @click="cancelarCaixaGordura">
                  Cancelar
                </button>
              </div>
            </form>
          </div>

          <p v-if="erroCaixaGordura" class="msg erro">{{ erroCaixaGordura }}</p>
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
import * as caixaGorduraService from '@/services/caixaGorduraService'
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
  {
    id: 'caixa-gordura',
    nome: 'Caixa de gordura e sabão',
    descricao: 'Volume da caixa a partir da taxa de ocupação e do número de apartamentos.',
  },
]

// Limite espelhado no backend (CaixaGorduraService.MAX_POR_EMPREENDIMENTO).
const MAX_CAIXAS_GORDURA = 2
const CAIXA_GORDURA_VAZIA = { id: null, taxaOcupacao: 4, numApartamentos: null }

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

const caixasGordura = ref([])
const caixaGorduraForm = ref({ ...CAIXA_GORDURA_VAZIA })
const formCaixaGorduraAberto = ref(false)
const carregandoCaixasGordura = ref(false)
const salvandoCaixaGordura = ref(false)
const caixaGorduraParaRemover = ref(null)
const removendoCaixaGordura = ref(false)
const erroCaixaGordura = ref('')

const podeAdicionarCaixaGordura = computed(() => caixasGordura.value.length < MAX_CAIXAS_GORDURA)

const tituloFormCaixaGordura = computed(() => {
  if (!caixaGorduraForm.value.id) return 'Novo cálculo'
  const posicao = caixasGordura.value.findIndex((caixa) => caixa.id === caixaGorduraForm.value.id)
  return `Alterando cálculo ${posicao + 1}`
})

const abaAtiva = computed(() => (route.query.aba === 'dados' ? 'dados' : 'calculos'))

function trocarAba(aba) {
  router.replace({ query: { ...route.query, aba } })
}

function selecionarCalculo(id) {
  calculoAtivo.value = calculoAtivo.value === id ? '' : id
  erroPrumada.value = ''
  resultadoPrumada.value = null
  erroCaixaGordura.value = ''
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

async function carregarCaixasGordura() {
  carregandoCaixasGordura.value = true
  try {
    caixasGordura.value = await caixaGorduraService.listarPorEmpreendimento(props.id)
  } catch {
    erroCaixaGordura.value = 'Não foi possível carregar os cálculos já registrados.'
  } finally {
    carregandoCaixasGordura.value = false
  }
}

function novoCaixaGordura() {
  caixaGorduraForm.value = { ...CAIXA_GORDURA_VAZIA }
  formCaixaGorduraAberto.value = true
  caixaGorduraParaRemover.value = null
  erroCaixaGordura.value = ''
}

function editarCaixaGordura(caixa) {
  caixaGorduraForm.value = {
    id: caixa.id,
    taxaOcupacao: caixa.taxaOcupacao,
    numApartamentos: caixa.numApartamentos,
  }
  formCaixaGorduraAberto.value = true
  caixaGorduraParaRemover.value = null
  erroCaixaGordura.value = ''
}

async function handleRemoverCaixaGordura(caixa) {
  erroCaixaGordura.value = ''
  removendoCaixaGordura.value = true

  try {
    await caixaGorduraService.excluir(caixa.id)
    // O formulário pode estar aberto justamente sobre o cálculo removido.
    if (caixaGorduraForm.value.id === caixa.id) {
      cancelarCaixaGordura()
    }
    await carregarCaixasGordura()
    caixaGorduraParaRemover.value = null
  } catch (error) {
    erroCaixaGordura.value = error.response?.data?.mensagem ?? 'Não foi possível remover o cálculo.'
  } finally {
    removendoCaixaGordura.value = false
  }
}

function cancelarCaixaGordura() {
  formCaixaGorduraAberto.value = false
  caixaGorduraForm.value = { ...CAIXA_GORDURA_VAZIA }
  erroCaixaGordura.value = ''
}

async function handleSalvarCaixaGordura() {
  erroCaixaGordura.value = ''
  salvandoCaixaGordura.value = true

  const { id, taxaOcupacao, numApartamentos } = caixaGorduraForm.value
  const dados = { empreendimentoId: Number(props.id), taxaOcupacao, numApartamentos }

  try {
    if (id) {
      await caixaGorduraService.atualizar(id, dados)
    } else {
      await caixaGorduraService.criar(dados)
    }
    await carregarCaixasGordura()
    cancelarCaixaGordura()
  } catch (error) {
    erroCaixaGordura.value =
      error.response?.data?.mensagem ?? 'Não foi possível calcular a caixa de gordura e sabão.'
  } finally {
    salvandoCaixaGordura.value = false
  }
}

onMounted(async () => {
  await carregarEmpreendimento()
  if (empreendimento.value) {
    await carregarCaixasGordura()
  }
})
</script>
