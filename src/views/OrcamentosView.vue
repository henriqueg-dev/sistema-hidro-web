<template>
  <AppLayout title="Orçamentos">
    <p class="subtitle">
      Preço do serviço de projeto para um empreendimento ainda não cadastrado. Prédio cobra por
      número de apartamentos; Casa e Galpão cobram por m². Ao aprovar, o empreendimento é criado
      automaticamente na aba Empreendimentos do cliente.
    </p>

    <section class="card">
      <h2>{{ orcamentoEmEdicao ? 'Editar orçamento' : 'Novo orçamento' }}</h2>

      <div v-if="orcamentoEmEdicao" class="painel">
        <div class="painel-item">
          <span>Cliente</span>
          <strong>{{ orcamentoEmEdicao.clienteNome }}</strong>
        </div>
      </div>

      <div v-else class="form-linha">
        <div class="field amplo">
          <label for="cliente">Cliente</label>
          <select id="cliente" v-model="clienteSelecionadoId">
            <option :value="null" disabled>Selecione um cliente</option>
            <option v-for="cliente in buscaCliente.itens" :key="cliente.id" :value="cliente.id">
              {{ cliente.nome }}
            </option>
          </select>
        </div>
      </div>

      <form
        v-if="clienteSelecionadoId || orcamentoEmEdicao"
        class="form-linha"
        style="margin-top: 1rem"
        @submit.prevent="handleSalvar"
      >
        <div class="field amplo">
          <label for="nomeEmpreendimento">Nome do empreendimento</label>
          <input
            id="nomeEmpreendimento"
            v-model="form.nomeEmpreendimento"
            type="text"
            required
            placeholder="Ex: Edifício Central"
          />
        </div>

        <div class="field">
          <label for="tipoEmpreendimento">Tipo</label>
          <select id="tipoEmpreendimento" v-model="form.tipoEmpreendimento">
            <option v-for="(rotulo, valor) in TIPOS_EMPREENDIMENTO" :key="valor" :value="valor">
              {{ rotulo }}
            </option>
          </select>
        </div>

        <div class="field">
          <label for="quantidade">{{ unidadeRotulo === 'apartamentos' ? 'Número de apartamentos' : 'Área (m²)' }}</label>
          <input id="quantidade" v-model.number="form.quantidade" type="number" min="0" step="0.01" required />
        </div>

        <div class="field">
          <label for="valorUnitario">Valor por {{ unidadeRotulo === 'apartamentos' ? 'apartamento' : 'm²' }} (R$)</label>
          <input id="valorUnitario" v-model.number="form.valorUnitario" type="number" min="0" step="0.01" required />
        </div>

        <div class="field estreito">
          <label for="validadeDias">Validade (dias)</label>
          <input id="validadeDias" v-model.number="form.validadeDias" type="number" min="1" required />
        </div>

        <div class="field">
          <label for="status">Status</label>
          <select id="status" v-model="form.status">
            <option v-for="(rotulo, valor) in STATUS_ORCAMENTO" :key="valor" :value="valor">
              {{ rotulo }}
            </option>
          </select>
        </div>

        <div class="field amplo" style="flex-basis: 100%">
          <label for="observacoes">Observações</label>
          <textarea
            id="observacoes"
            v-model="form.observacoes"
            rows="3"
            placeholder="Prazo de entrega, forma de pagamento, o que está incluso..."
          ></textarea>
        </div>

        <div class="calculo-destaque" style="flex-basis: 100%">
          <span>Valor total</span>
          <strong>R$ {{ fmt(valorTotalPreview, 2) }}</strong>
        </div>

        <div class="field actions">
          <button type="submit" :disabled="salvando">
            {{ salvando ? 'Salvando...' : orcamentoEmEdicao ? 'Salvar alterações' : 'Criar orçamento' }}
          </button>
          <button type="button" class="btn-secundario" @click="cancelarEdicao">Cancelar</button>
        </div>
      </form>

      <p v-if="erro" class="msg erro">{{ erro }}</p>
      <p v-if="sucesso" class="msg sucesso">{{ sucesso }}</p>
    </section>

    <section class="card">
      <h2>Orçamentos registrados</h2>

      <div v-if="orcamentos.length" class="painel">
        <div class="painel-item">
          <span>Em aberto (enviados)</span>
          <strong>R$ {{ fmt(resumo.emAberto, 2) }}</strong>
        </div>
        <div class="painel-item">
          <span>Aprovado</span>
          <strong>R$ {{ fmt(resumo.aprovado, 2) }}</strong>
        </div>
        <div class="painel-item">
          <span>Orçamentos</span>
          <strong>{{ orcamentos.length }}</strong>
        </div>
      </div>

      <nav class="abas">
        <button type="button" class="aba" :class="{ ativa: abaAtiva === 'TODOS' }" @click="trocarAba('TODOS')">
          Todos ({{ orcamentos.length }})
        </button>
        <button
          v-for="(rotulo, valor) in STATUS_ORCAMENTO"
          :key="valor"
          type="button"
          class="aba"
          :class="{ ativa: abaAtiva === valor }"
          @click="trocarAba(valor)"
        >
          {{ rotulo }} ({{ contagemPorStatus[valor] ?? 0 }})
        </button>
      </nav>

      <p v-if="carregandoLista" class="subtitle">Carregando...</p>
      <p v-else-if="!orcamentosFiltrados.length" class="subtitle">Nenhum orçamento nesse status.</p>

      <table v-else class="tabela">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Empreendimento</th>
            <th>Quantidade</th>
            <th>Valor total</th>
            <th>Status</th>
            <th>Validade</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="orc in orcamentosFiltrados" :key="orc.id">
            <td>{{ orc.clienteNome }}</td>
            <td>{{ orc.nomeEmpreendimento }}</td>
            <td>{{ fmt(orc.quantidade, 0) }} {{ orc.tipoEmpreendimento === 'Prédio' ? 'apartamentos' : 'm²' }}</td>
            <td>R$ {{ fmt(orc.valorTotal, 2) }}</td>
            <td>
              <select
                :value="chavePorRotulo(STATUS_ORCAMENTO, orc.status)"
                @change="handleMudarStatus(orc, $event.target.value)"
              >
                <option v-for="(rotulo, valor) in STATUS_ORCAMENTO" :key="valor" :value="valor">
                  {{ rotulo }}
                </option>
              </select>
            </td>
            <td>
              {{ formatarData(orc.dataValidade) }}
              <span v-if="estaVencido(orc)" class="status vencido">Vencido</span>
            </td>
            <td class="acoes">
              <button type="button" class="btn-link" @click="handleBaixarPdf(orc)">PDF</button>
              <button type="button" class="btn-link" @click="abrirHistorico(orc)">Histórico</button>
              <button type="button" class="btn-link" @click="iniciarEdicao(orc)">Editar</button>
              <template v-if="paraRemover === orc.id">
                <button type="button" class="btn-link perigo" @click="handleExcluir(orc)">Sim, remover</button>
                <button type="button" class="btn-link" @click="paraRemover = null">Cancelar</button>
              </template>
              <button v-else type="button" class="btn-link perigo" @click="paraRemover = orc.id">
                Remover
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <div v-if="modalAberto" class="modal-fundo" @click.self="cancelarModal">
      <div class="card modal-caixa">
        <h2>Completar dados do empreendimento</h2>
        <p class="subtitle">
          Necessário pra criar o empreendimento na aba Empreendimentos quando o orçamento é aprovado.
        </p>

        <div class="form-linha">
          <div class="field estreito">
            <label for="modalPavimentos">Pavimentos</label>
            <input id="modalPavimentos" v-model.number="camposAprovacao.numPavimentos" type="number" min="1" required />
          </div>
          <div class="field amplo">
            <label for="modalEndereco">Endereço</label>
            <input id="modalEndereco" v-model="camposAprovacao.endereco" type="text" required placeholder="Rua, número, bairro" />
          </div>
          <div class="field">
            <label for="modalConcessionaria">Concessionária</label>
            <select id="modalConcessionaria" v-model="camposAprovacao.concessionaria" required>
              <option value="" disabled>Selecione</option>
              <option v-for="(rotulo, valor) in CONCESSIONARIAS" :key="valor" :value="valor">
                {{ rotulo }}
              </option>
            </select>
          </div>
        </div>

        <p v-if="erroModal" class="msg erro">{{ erroModal }}</p>

        <div class="form-linha modal-acoes" style="margin-top: 1rem">
          <button type="button" :disabled="confirmandoModal" @click="confirmarModal">
            {{ confirmandoModal ? 'Aprovando...' : 'Aprovar e criar empreendimento' }}
          </button>
          <button type="button" class="btn-secundario" @click="cancelarModal">Cancelar</button>
        </div>
      </div>

    </div>
    <div v-if="historicoAberto" class="modal-fundo" @click.self="historicoAberto = false">
      <div class="card modal-caixa ampla">
        <h2>Histórico do orçamento</h2>
        <p class="subtitle">{{ historicoTitulo }}</p>

        <p v-if="carregandoHistorico" class="subtitle">Carregando...</p>
        <p v-else-if="erroHistorico" class="msg erro">{{ erroHistorico }}</p>
        <p v-else-if="!historico.length" class="subtitle">Nenhuma alteração registrada.</p>

        <table v-else class="tabela">
          <thead>
            <tr>
              <th>Quando</th>
              <th>Quem</th>
              <th>Ação</th>
              <th>Valor total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="linha in historico" :key="linha.revisao">
              <td>{{ formatarDataHora(linha.dataOperacao) }}</td>
              <td>
                {{ linha.usuarioNome ?? '—' }}
                <small v-if="linha.usuarioEmail" class="linha-secundaria">{{ linha.usuarioEmail }}</small>
              </td>
              <td>{{ ACOES_AUDITORIA[linha.acao] ?? linha.acao }}</td>
              <td>R$ {{ fmt(linha.valores.valorTotal, 2) }}</td>
              <td>{{ linha.valores.status ?? '—' }}</td>
            </tr>
          </tbody>
        </table>

        <div class="form-linha modal-acoes" style="margin-top: 1rem">
          <button type="button" class="btn-secundario" @click="historicoAberto = false">Fechar</button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { useListaBuscavel } from '@/composables/useListaBuscavel'
import * as clienteService from '@/services/clienteService'
import * as orcamentoService from '@/services/orcamentoService'
import * as auditoriaService from '@/services/auditoriaService'
import { TIPOS_EMPREENDIMENTO, STATUS_ORCAMENTO, CONCESSIONARIAS } from '@/constants/opcoes'

const route = useRoute()
const router = useRouter()

const buscaCliente = useListaBuscavel(clienteService.listarTodos, 'Não foi possível carregar os clientes.')
const clienteSelecionadoId = ref(null)

const orcamentoEmEdicao = ref(null)
const form = ref(novoForm())
const unidadeRotulo = computed(() => (form.value.tipoEmpreendimento === 'PREDIO' ? 'apartamentos' : 'm²'))
const valorTotalPreview = computed(() => (Number(form.value.quantidade) || 0) * (Number(form.value.valorUnitario) || 0))

const salvando = ref(false)
const erro = ref('')
const sucesso = ref('')
const paraRemover = ref(null)

const orcamentos = ref([])
const carregandoLista = ref(true)
const abaAtiva = computed(() => route.query.aba ?? 'TODOS')
const orcamentosFiltrados = computed(() =>
  abaAtiva.value === 'TODOS'
    ? orcamentos.value
    : orcamentos.value.filter((orc) => orc.status === STATUS_ORCAMENTO[abaAtiva.value]),
)

const contagemPorStatus = computed(() =>
  Object.fromEntries(
    Object.entries(STATUS_ORCAMENTO).map(([chave, rotulo]) => [
      chave,
      orcamentos.value.filter((orc) => orc.status === rotulo).length,
    ]),
  ),
)

const resumo = computed(() => ({
  emAberto: somarPorStatus(STATUS_ORCAMENTO.ENVIADO),
  aprovado: somarPorStatus(STATUS_ORCAMENTO.APROVADO),
}))

function somarPorStatus(rotulo) {
  return orcamentos.value
    .filter((orc) => orc.status === rotulo)
    .reduce((total, orc) => total + (orc.valorTotal ?? 0), 0)
}

/** Vencido só importa enquanto o orçamento ainda está em negociação. */
function estaVencido(orc) {
  const emNegociacao = orc.status === STATUS_ORCAMENTO.RASCUNHO || orc.status === STATUS_ORCAMENTO.ENVIADO
  return emNegociacao && !!orc.dataValidade && orc.dataValidade < hojeISO()
}

function hojeISO() {
  return new Date().toLocaleDateString('en-CA')
}

function trocarAba(aba) {
  router.replace({ query: { ...route.query, aba } })
}

const historicoAberto = ref(false)
const historico = ref([])
const carregandoHistorico = ref(false)
const erroHistorico = ref('')
const historicoTitulo = ref('')
const ACOES_AUDITORIA = { CRIACAO: 'Criação', ALTERACAO: 'Alteração', EXCLUSAO: 'Exclusão' }

const modalAberto = ref(false)
const confirmandoModal = ref(false)
const erroModal = ref('')
const camposAprovacao = ref(novosCamposAprovacao())
const acaoPendente = ref(null)

function novoForm() {
  return {
    nomeEmpreendimento: '',
    tipoEmpreendimento: 'CASA',
    quantidade: null,
    valorUnitario: null,
    validadeDias: 30,
    status: 'RASCUNHO',
    observacoes: '',
  }
}

function novosCamposAprovacao() {
  return { numPavimentos: null, endereco: '', concessionaria: '' }
}

function chavePorRotulo(mapa, valorApi) {
  return Object.keys(mapa).find((chave) => mapa[chave] === valorApi) ?? valorApi
}

function fmt(valor, casas) {
  return Number(valor ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
}

function formatarDataHora(valor) {
  return valor ? new Date(valor).toLocaleString('pt-BR') : '—'
}

async function abrirHistorico(orc) {
  historicoAberto.value = true
  historicoTitulo.value = `${orc.clienteNome} — ${orc.nomeEmpreendimento}`
  historico.value = []
  erroHistorico.value = ''
  carregandoHistorico.value = true

  try {
    historico.value = await auditoriaService.historico('ORCAMENTO', orc.id)
  } catch {
    erroHistorico.value = 'Não foi possível carregar o histórico.'
  } finally {
    carregandoHistorico.value = false
  }
}

function formatarData(data) {
  return data ? new Date(data + 'T00:00:00').toLocaleDateString('pt-BR') : '—'
}

function iniciarEdicao(orc) {
  orcamentoEmEdicao.value = orc
  clienteSelecionadoId.value = null
  form.value = {
    nomeEmpreendimento: orc.nomeEmpreendimento,
    tipoEmpreendimento: chavePorRotulo(TIPOS_EMPREENDIMENTO, orc.tipoEmpreendimento),
    quantidade: orc.quantidade,
    valorUnitario: orc.valorUnitario,
    validadeDias: orc.validadeDias,
    status: chavePorRotulo(STATUS_ORCAMENTO, orc.status),
    observacoes: orc.observacoes ?? '',
  }
  erro.value = ''
  sucesso.value = ''
}

function cancelarEdicao() {
  orcamentoEmEdicao.value = null
  clienteSelecionadoId.value = null
  form.value = novoForm()
}

async function carregarLista() {
  carregandoLista.value = true
  try {
    orcamentos.value = await orcamentoService.listarTodos()
  } catch {
    erro.value = 'Não foi possível carregar os orçamentos.'
  } finally {
    carregandoLista.value = false
  }
}

function precisaCompletarAprovacao(status, orc) {
  return status === 'APROVADO' && !orc?.empreendimentoGeradoId
}

function abrirModalAprovacao(executar) {
  camposAprovacao.value = novosCamposAprovacao()
  erroModal.value = ''
  acaoPendente.value = executar
  modalAberto.value = true
}

function cancelarModal() {
  modalAberto.value = false
  acaoPendente.value = null
}

async function confirmarModal() {
  const executar = acaoPendente.value
  if (!executar) return
  erroModal.value = ''
  confirmandoModal.value = true
  try {
    await executar(camposAprovacao.value)
    modalAberto.value = false
    acaoPendente.value = null
  } catch (error) {
    erroModal.value = error.response?.data?.mensagem ?? 'Não foi possível aprovar o orçamento.'
  } finally {
    confirmandoModal.value = false
  }
}

async function salvarOrcamento(dados) {
  erro.value = ''
  sucesso.value = ''
  salvando.value = true
  try {
    if (orcamentoEmEdicao.value) {
      await orcamentoService.atualizar(orcamentoEmEdicao.value.id, dados)
      sucesso.value = 'Orçamento atualizado.'
    } else {
      await orcamentoService.criar(dados)
      sucesso.value = 'Orçamento criado.'
    }
    cancelarEdicao()
    await carregarLista()
  } finally {
    salvando.value = false
  }
}

async function handleSalvar() {
  const dados = {
    clienteId: orcamentoEmEdicao.value?.clienteId ?? clienteSelecionadoId.value,
    ...form.value,
  }

  if (precisaCompletarAprovacao(dados.status, orcamentoEmEdicao.value)) {
    abrirModalAprovacao((extra) => salvarOrcamento({ ...dados, ...extra }))
    return
  }

  try {
    await salvarOrcamento(dados)
  } catch (error) {
    erro.value = error.response?.data?.mensagem ?? 'Não foi possível salvar o orçamento.'
  }
}

async function handleMudarStatus(orc, status) {
  const dados = {
    clienteId: orc.clienteId,
    nomeEmpreendimento: orc.nomeEmpreendimento,
    tipoEmpreendimento: orc.tipoEmpreendimento,
    quantidade: orc.quantidade,
    valorUnitario: orc.valorUnitario,
    validadeDias: orc.validadeDias,
    observacoes: orc.observacoes,
    status,
  }

  erro.value = ''
  if (precisaCompletarAprovacao(status, orc)) {
    abrirModalAprovacao(async (extra) => {
      await orcamentoService.atualizar(orc.id, { ...dados, ...extra })
      await carregarLista()
    })
    return
  }

  try {
    await orcamentoService.atualizar(orc.id, dados)
    await carregarLista()
  } catch {
    erro.value = 'Não foi possível atualizar o status.'
  }
}

async function handleExcluir(orc) {
  erro.value = ''
  try {
    await orcamentoService.excluir(orc.id)
    paraRemover.value = null
    await carregarLista()
  } catch {
    erro.value = 'Não foi possível remover o orçamento.'
  }
}

async function handleBaixarPdf(orc) {
  erro.value = ''
  try {
    const blob = await orcamentoService.baixarPdf(orc.id)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `orcamento-${orc.id}.pdf`
    link.click()
    URL.revokeObjectURL(url)
  } catch {
    erro.value = 'Não foi possível gerar o PDF do orçamento.'
  }
}

onMounted(() => {
  buscaCliente.carregar()
  carregarLista()
})
</script>

