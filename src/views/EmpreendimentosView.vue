<template>
  <AppLayout title="Empreendimentos">
    <section class="card">
      <h2>Novo empreendimento</h2>
      <p v-if="!empresas.length" class="subtitle">
        Cadastre uma empresa antes de criar um empreendimento.
      </p>

      <form v-else class="form-grid" @submit.prevent="handleCriar">
        <div class="field">
          <label for="empresa">Empresa</label>
          <select id="empresa" v-model="form.empresaId" required>
            <option value="" disabled>Selecione</option>
            <option v-for="empresa in empresas" :key="empresa.id" :value="empresa.id">
              {{ empresa.nome }}
            </option>
          </select>
        </div>

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
      <div class="card-header">
        <h2>Empreendimentos</h2>
        <select v-if="empresas.length" v-model="empresaSelecionada" class="filtro">
          <option v-for="empresa in empresas" :key="empresa.id" :value="empresa.id">
            {{ empresa.nome }}
          </option>
        </select>
      </div>

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
  </AppLayout>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import * as empresaService from '@/services/empresaService'
import * as empreendimentoService from '@/services/empreendimentoService'

const empresas = ref([])
const empresaSelecionada = ref('')
const empreendimentos = ref([])
const carregandoLista = ref(false)

const form = ref({
  nome: '',
  tipo: 'CASA',
  numPavimentos: null,
  endereco: '',
  concessionaria: '',
  empresaId: '',
})
const criando = ref(false)
const erro = ref('')
const sucesso = ref('')

async function carregarEmpresas() {
  try {
    empresas.value = await empresaService.listarTodas()
    if (empresas.value.length) {
      empresaSelecionada.value = empresas.value[0].id
    }
  } catch {
    erro.value = 'Não foi possível carregar as empresas.'
  }
}

async function carregarEmpreendimentos() {
  if (!empresaSelecionada.value) {
    empreendimentos.value = []
    return
  }
  carregandoLista.value = true
  try {
    empreendimentos.value = await empreendimentoService.listarPorEmpresa(empresaSelecionada.value)
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
    await empreendimentoService.criar({ ...form.value, empresaId: form.value.empresaId })
    sucesso.value = `Empreendimento "${form.value.nome}" criado com sucesso.`
    form.value = {
      nome: '',
      tipo: 'CASA',
      numPavimentos: null,
      endereco: '',
      concessionaria: '',
      empresaId: '',
    }
    await carregarEmpreendimentos()
  } catch (error) {
    erro.value = error.response?.data?.mensagem ?? 'Não foi possível criar o empreendimento.'
  } finally {
    criando.value = false
  }
}

watch(empresaSelecionada, carregarEmpreendimentos)

onMounted(async () => {
  await carregarEmpresas()
})
</script>
