<template>
  <AppLayout>
    <RouterLink to="/empresas" class="voltar">&larr; Empresas</RouterLink>

    <h1 class="page-title">{{ empresa?.nome ?? 'Empresa' }}</h1>

    <p v-if="erroEmpresa" class="msg erro">{{ erroEmpresa }}</p>

    <template v-else>
      <nav class="abas">
        <button
          type="button"
          class="aba"
          :class="{ ativa: abaAtiva === 'empreendimentos' }"
          @click="trocarAba('empreendimentos')"
        >
          Empreendimentos
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
          <h2>Dados da empresa</h2>
          <button v-if="!carregandoEmpresa && !editando" class="btn-link" @click="iniciarEdicao">
            Editar
          </button>
        </div>

        <p v-if="carregandoEmpresa" class="subtitle">Carregando...</p>

        <form v-else-if="editando" class="form-row" @submit.prevent="handleSalvar">
          <div class="field">
            <label for="nomeEmpresa">Nome da empresa</label>
            <input id="nomeEmpresa" v-model="nomeEditado" type="text" required />
          </div>
          <button type="submit" :disabled="salvando">
            {{ salvando ? 'Salvando...' : 'Salvar' }}
          </button>
          <button type="button" class="btn-secundario" :disabled="salvando" @click="cancelarEdicao">
            Cancelar
          </button>
        </form>

        <div v-else class="painel">
          <div class="painel-item">
            <span>Nome</span>
            <strong>{{ empresa?.nome }}</strong>
          </div>
          <div class="painel-item">
            <span>Empreendimentos</span>
            <strong>{{ lista.itens.length }}</strong>
          </div>
        </div>

        <p v-if="erroEdicao" class="msg erro">{{ erroEdicao }}</p>
        <p v-if="sucessoEdicao" class="msg sucesso">{{ sucessoEdicao }}</p>
      </section>

      <template v-else>
        <section class="card">
          <h2>Adicionar empreendimento</h2>
          <p class="subtitle">Será vinculado a {{ empresa?.nome }}.</p>

          <form class="form-linha" @submit.prevent="handleCriar">
            <div class="field amplo">
              <label for="nome">Nome</label>
              <input
                id="nome"
                v-model="form.nome"
                type="text"
                required
                placeholder="Ex: Edifício Central"
              />
            </div>

            <div class="field">
              <label for="tipo">Tipo</label>
              <select id="tipo" v-model="form.tipo">
                <option v-for="(rotulo, valor) in TIPOS_EMPREENDIMENTO" :key="valor" :value="valor">
                  {{ rotulo }}
                </option>
              </select>
            </div>

            <div class="field estreito">
              <label for="numPavimentos">Pavimentos</label>
              <input
                id="numPavimentos"
                v-model.number="form.numPavimentos"
                type="number"
                min="1"
                required
              />
            </div>

            <div class="field amplo">
              <label for="endereco">Endereço</label>
              <input
                id="endereco"
                v-model="form.endereco"
                type="text"
                required
                placeholder="Rua, número, bairro"
              />
            </div>

            <div class="field">
              <label for="concessionaria">Concessionária</label>
              <input
                id="concessionaria"
                v-model="form.concessionaria"
                type="text"
                required
                placeholder="Ex: Sabesp"
              />
            </div>

            <div class="field actions">
              <button type="submit" :disabled="criando">
                {{ criando ? 'Adicionando...' : 'Adicionar' }}
              </button>
            </div>
          </form>

          <p v-if="erro" class="msg erro">{{ erro }}</p>
          <p v-if="sucesso" class="msg sucesso">{{ sucesso }}</p>
        </section>

        <section class="card">
          <div class="card-header">
            <div class="card-header-titulo">
              <h2>Empreendimentos</h2>
              <p class="subtitle">Clique em um empreendimento para ver seus dados e cálculos.</p>
            </div>

            <CampoBusca
              v-model="lista.busca"
              placeholder="Buscar empreendimento..."
              :ocupado="lista.carregando"
              @buscar="lista.carregar()"
            />
          </div>

          <p v-if="lista.erro" class="msg erro">{{ lista.erro }}</p>
          <p v-else-if="lista.carregando" class="subtitle">Carregando...</p>
          <p v-else-if="!lista.itens.length && lista.busca" class="subtitle">
            Nenhum empreendimento encontrado para "{{ lista.busca }}".
          </p>
          <p v-else-if="!lista.itens.length" class="subtitle">
            Nenhum empreendimento cadastrado para essa empresa.
          </p>

          <div v-else class="grade-cards">
            <CardItem
              v-for="empreendimento in lista.itens"
              :key="empreendimento.id"
              :nome="empreendimento.nome"
              :titulo="`${empreendimento.endereco} — ${empreendimento.concessionaria}`"
              :info="`${TIPOS_EMPREENDIMENTO[empreendimento.tipo] ?? empreendimento.tipo} · ${empreendimento.numPavimentos} pav.`"
              :to="{ name: 'empreendimento-detalhe', params: { id: empreendimento.id } }"
              aviso-exclusao="Excluir este empreendimento?"
              :excluindo="excluindoId === empreendimento.id"
              @editar="
                router.push({
                  name: 'empreendimento-detalhe',
                  params: { id: empreendimento.id },
                  query: { aba: 'dados', editar: '1' },
                })
              "
              @excluir="handleExcluirEmpreendimento(empreendimento)"
            />
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
import CampoBusca from '@/components/CampoBusca.vue'
import CardItem from '@/components/CardItem.vue'
import { useListaBuscavel } from '@/composables/useListaBuscavel'
import * as empresaService from '@/services/empresaService'
import * as empreendimentoService from '@/services/empreendimentoService'
import { TIPOS_EMPREENDIMENTO } from '@/constants/opcoes'

const props = defineProps({
  id: { type: String, required: true },
})

const route = useRoute()
const router = useRouter()

const empresa = ref(null)
const carregandoEmpresa = ref(false)
const erroEmpresa = ref('')

const editando = ref(false)
const nomeEditado = ref('')
const salvando = ref(false)
const erroEdicao = ref('')
const sucessoEdicao = ref('')

const excluindoId = ref(null)

const lista = useListaBuscavel(
  (termo) => empreendimentoService.listarPorEmpresa(props.id, termo),
  'Não foi possível carregar os empreendimentos.',
)

const form = ref(novoForm())
const criando = ref(false)
const erro = ref('')
const sucesso = ref('')

const abaAtiva = computed(() => (route.query.aba === 'dados' ? 'dados' : 'empreendimentos'))

function trocarAba(aba) {
  lista.limparBusca()
  router.replace({ query: { ...route.query, aba } })
}

function novoForm() {
  return {
    nome: '',
    tipo: 'CASA',
    numPavimentos: null,
    endereco: '',
    concessionaria: '',
  }
}

async function carregarEmpresa() {
  carregandoEmpresa.value = true
  try {
    empresa.value = await empresaService.buscarPorId(props.id)
  } catch {
    erroEmpresa.value = 'Não foi possível carregar a empresa.'
  } finally {
    carregandoEmpresa.value = false
  }
}

function iniciarEdicao() {
  nomeEditado.value = empresa.value?.nome ?? ''
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
    empresa.value = await empresaService.atualizar(props.id, { nome: nomeEditado.value })
    sucessoEdicao.value = 'Empresa atualizada com sucesso.'
    editando.value = false
  } catch (error) {
    erroEdicao.value = error.response?.data?.mensagem ?? 'Não foi possível atualizar a empresa.'
  } finally {
    salvando.value = false
  }
}

async function handleExcluirEmpreendimento(empreendimento) {
  erro.value = ''
  sucesso.value = ''
  excluindoId.value = empreendimento.id

  try {
    await empreendimentoService.excluir(empreendimento.id)
    sucesso.value = `Empreendimento "${empreendimento.nome}" excluído.`
    await lista.carregar()
  } catch (error) {
    erro.value = error.response?.data?.mensagem ?? 'Não foi possível excluir o empreendimento.'
  } finally {
    excluindoId.value = null
  }
}

async function handleCriar() {
  erro.value = ''
  sucesso.value = ''
  criando.value = true

  try {
    await empreendimentoService.criar({ ...form.value, empresaId: props.id })
    sucesso.value = `Empreendimento "${form.value.nome}" adicionado com sucesso.`
    form.value = novoForm()
    await lista.carregar()
  } catch (error) {
    erro.value = error.response?.data?.mensagem ?? 'Não foi possível adicionar o empreendimento.'
  } finally {
    criando.value = false
  }
}

onMounted(() => {
  carregarEmpresa()
  lista.carregar()
})
</script>
