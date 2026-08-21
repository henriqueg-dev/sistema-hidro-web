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
      <div class="card-header">
        <div class="card-header-titulo">
          <h2>Empresas cadastradas</h2>
          <p class="subtitle">Clique em uma empresa para ver seus dados e empreendimentos.</p>
        </div>

        <CampoBusca
          v-model="lista.busca"
          placeholder="Buscar empresa..."
          :ocupado="lista.carregando"
          @buscar="lista.carregar()"
        />
      </div>

      <p v-if="lista.erro" class="msg erro">{{ lista.erro }}</p>
      <p v-else-if="lista.carregando" class="subtitle">Carregando...</p>
      <p v-else-if="!lista.itens.length && lista.busca" class="subtitle">
        Nenhuma empresa encontrada para "{{ lista.busca }}".
      </p>
      <p v-else-if="!lista.itens.length" class="subtitle">Nenhuma empresa cadastrada ainda.</p>

      <div v-else class="grade-cards">
        <CardItem
          v-for="empresa in lista.itens"
          :key="empresa.id"
          :nome="empresa.nome"
          :to="{ name: 'empresa-detalhe', params: { id: empresa.id } }"
          aviso-exclusao="Excluir a empresa e todos os seus empreendimentos?"
          :excluindo="excluindoId === empresa.id"
          @editar="
            $router.push({
              name: 'empresa-detalhe',
              params: { id: empresa.id },
              query: { aba: 'dados' },
            })
          "
          @excluir="handleExcluir(empresa)"
        />
      </div>
    </section>
  </AppLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import CampoBusca from '@/components/CampoBusca.vue'
import CardItem from '@/components/CardItem.vue'
import { useListaBuscavel } from '@/composables/useListaBuscavel'
import * as empresaService from '@/services/empresaService'

const lista = useListaBuscavel(
  (termo) => empresaService.listarTodas(termo),
  'Não foi possível carregar as empresas.',
)

const excluindoId = ref(null)

const nome = ref('')
const criando = ref(false)
const erro = ref('')
const sucesso = ref('')

async function handleCriar() {
  erro.value = ''
  sucesso.value = ''
  criando.value = true

  try {
    await empresaService.criar({ nome: nome.value })
    sucesso.value = `Empresa "${nome.value}" adicionada com sucesso.`
    nome.value = ''
    await lista.carregar()
  } catch (error) {
    erro.value = error.response?.data?.mensagem ?? 'Não foi possível adicionar a empresa.'
  } finally {
    criando.value = false
  }
}

async function handleExcluir(empresa) {
  erro.value = ''
  sucesso.value = ''
  excluindoId.value = empresa.id

  try {
    await empresaService.excluir(empresa.id)
    sucesso.value = `Empresa "${empresa.nome}" excluída com seus empreendimentos.`
    await lista.carregar()
  } catch (error) {
    erro.value = error.response?.data?.mensagem ?? 'Não foi possível excluir a empresa.'
  } finally {
    excluindoId.value = null
  }
}

onMounted(lista.carregar)
</script>
