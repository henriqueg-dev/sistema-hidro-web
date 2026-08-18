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
          :class="{ ativa: abaAtiva === 'dados' }"
          @click="trocarAba('dados')"
        >
          Dados
        </button>
        <button
          type="button"
          class="aba"
          :class="{ ativa: abaAtiva === 'empreendimentos' }"
          @click="trocarAba('empreendimentos')"
        >
          Empreendimentos
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
            <strong>{{ empreendimentos.length }}</strong>
          </div>
        </div>

        <p v-if="erroEdicao" class="msg erro">{{ erroEdicao }}</p>
        <p v-if="sucessoEdicao" class="msg sucesso">{{ sucessoEdicao }}</p>
      </section>

      <template v-else>
        <section class="card">
          <h2>Novo empreendimento</h2>
          <p class="subtitle">Será vinculado a {{ empresa?.nome }}.</p>

          <form class="form-grid" @submit.prevent="handleCriar">
            <div class="field">
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
                <option value="CASA">Casa</option>
                <option value="PREDIO">Prédio</option>
                <option value="GALPAO">Galpão</option>
              </select>
            </div>

            <div class="field">
              <label for="numPavimentos">Número de pavimentos</label>
              <input
                id="numPavimentos"
                v-model.number="form.numPavimentos"
                type="number"
                min="1"
                required
              />
            </div>

            <div class="field">
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
                {{ criando ? 'Criando...' : 'Criar empreendimento' }}
              </button>
            </div>
          </form>

          <p v-if="erro" class="msg erro">{{ erro }}</p>
          <p v-if="sucesso" class="msg sucesso">{{ sucesso }}</p>
        </section>

        <section class="card">
          <h2>Empreendimentos</h2>

          <p v-if="carregandoLista" class="subtitle">Carregando...</p>
          <p v-else-if="!empreendimentos.length" class="subtitle">
            Nenhum empreendimento cadastrado para essa empresa.
          </p>

          <table v-else class="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Pavimentos</th>
                <th>Endereço</th>
                <th>Concessionária</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="empreendimento in empreendimentos" :key="empreendimento.id">
                <td>{{ empreendimento.nome }}</td>
                <td>
                  <span class="badge">{{ empreendimento.tipo }}</span>
                </td>
                <td>{{ empreendimento.numPavimentos }}</td>
                <td>{{ empreendimento.endereco }}</td>
                <td>{{ empreendimento.concessionaria }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </template>
    </template>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import * as empresaService from '@/services/empresaService'
import * as empreendimentoService from '@/services/empreendimentoService'

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

const empreendimentos = ref([])
const carregandoLista = ref(false)

const form = ref(novoForm())
const criando = ref(false)
const erro = ref('')
const sucesso = ref('')

const abaAtiva = computed(() =>
  route.query.aba === 'empreendimentos' ? 'empreendimentos' : 'dados',
)

function trocarAba(aba) {
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

async function carregarEmpreendimentos() {
  carregandoLista.value = true
  try {
    empreendimentos.value = await empreendimentoService.listarPorEmpresa(props.id)
  } catch {
    erro.value = 'Não foi possível carregar os empreendimentos.'
  } finally {
    carregandoLista.value = false
  }
}

async function handleCriar() {
  erro.value = ''
  sucesso.value = ''
  criando.value = true

  try {
    await empreendimentoService.criar({ ...form.value, empresaId: props.id })
    sucesso.value = `Empreendimento "${form.value.nome}" criado com sucesso.`
    form.value = novoForm()
    await carregarEmpreendimentos()
  } catch (error) {
    erro.value = error.response?.data?.mensagem ?? 'Não foi possível criar o empreendimento.'
  } finally {
    criando.value = false
  }
}

onMounted(() => {
  carregarEmpresa()
  carregarEmpreendimentos()
})
</script>
