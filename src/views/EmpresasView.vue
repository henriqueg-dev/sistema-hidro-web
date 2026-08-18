<template>
  <AppLayout title="Empresas">
    <section class="card">
      <h2>Adicionar empresa</h2>
      <form class="form-row" @submit.prevent="handleCriar">
        <div class="field">
          <label for="nome">Nome da empresa</label>
          <input id="nome" v-model="nome" type="text" required placeholder="Ex: Construtora Alfa" />
        </div>
        <button type="submit" :disabled="criando">
          {{ criando ? 'Adicionando...' : 'Adicionar empresa' }}
        </button>
      </form>

      <p v-if="erro" class="msg erro">{{ erro }}</p>
      <p v-if="sucesso" class="msg sucesso">{{ sucesso }}</p>
    </section>

    <section class="card">
      <h2>Empresas cadastradas</h2>
      <p class="subtitle">Clique em uma empresa para ver seus dados e empreendimentos.</p>

      <p v-if="carregandoLista" class="subtitle">Carregando...</p>
      <p v-else-if="!empresas.length" class="subtitle">Nenhuma empresa cadastrada ainda.</p>

      <div v-else class="grade-cards">
        <RouterLink
          v-for="empresa in empresas"
          :key="empresa.id"
          class="card-item"
          :to="{ name: 'empresa-detalhe', params: { id: empresa.id } }"
        >
          <div class="card-item-icone">
            <span class="card-item-iniciais">{{ iniciais(empresa.nome) }}</span>
          </div>

          <strong class="card-item-nome" :title="empresa.nome">{{ empresa.nome }}</strong>
        </RouterLink>
      </div>
    </section>
  </AppLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import * as empresaService from '@/services/empresaService'

const empresas = ref([])
const carregandoLista = ref(false)

const nome = ref('')
const criando = ref(false)
const erro = ref('')
const sucesso = ref('')

async function carregarEmpresas() {
  carregandoLista.value = true
  try {
    empresas.value = await empresaService.listarTodas()
  } catch {
    erro.value = 'Não foi possível carregar as empresas.'
  } finally {
    carregandoLista.value = false
  }
}

async function handleCriar() {
  erro.value = ''
  sucesso.value = ''
  criando.value = true

  try {
    await empresaService.criar({ nome: nome.value })
    sucesso.value = `Empresa "${nome.value}" adicionada com sucesso.`
    nome.value = ''
    await carregarEmpresas()
  } catch (error) {
    erro.value = error.response?.data?.mensagem ?? 'Não foi possível adicionar a empresa.'
  } finally {
    criando.value = false
  }
}

function iniciais(nomeEmpresa) {
  return nomeEmpresa
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palavra) => palavra[0].toUpperCase())
    .join('')
}

onMounted(carregarEmpresas)
</script>
