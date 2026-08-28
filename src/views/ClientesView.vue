<template>
  <AppLayout title="Clientes">
    <section class="card">
      <h2>Adicionar cliente</h2>
      <form class="form-row" @submit.prevent="handleCriar">
        <div class="field">
          <label for="nome">Nome do cliente</label>
          <input id="nome" v-model="nome" type="text" required placeholder="Ex: Construtora Alfa" />
        </div>
        <button type="submit" :disabled="criando">
          {{ criando ? 'Adicionando...' : 'Adicionar cliente' }}
        </button>
      </form>

      <p v-if="erro" class="msg erro">{{ erro }}</p>
      <p v-if="sucesso" class="msg sucesso">{{ sucesso }}</p>
    </section>

    <section class="card">
      <div class="card-header">
        <div class="card-header-titulo">
          <h2>Clientes cadastrados</h2>
          <p class="subtitle">Clique em um cliente para ver seus dados e empreendimentos.</p>
        </div>

        <CampoBusca
          v-model="lista.busca"
          placeholder="Buscar cliente..."
          :ocupado="lista.carregando"
          @buscar="lista.carregar()"
        />
      </div>

      <p v-if="lista.erro" class="msg erro">{{ lista.erro }}</p>
      <p v-else-if="lista.carregando" class="subtitle">Carregando...</p>
      <p v-else-if="!lista.itens.length && lista.busca" class="subtitle">
        Nenhum cliente encontrada para "{{ lista.busca }}".
      </p>
      <p v-else-if="!lista.itens.length" class="subtitle">Nenhum cliente cadastrada ainda.</p>

      <div v-else class="grade-cards">
        <CardItem
          v-for="cliente in lista.itens"
          :key="cliente.id"
          :nome="cliente.nome"
          :to="{ name: 'cliente-detalhe', params: { id: cliente.id } }"
          aviso-exclusao="Excluir o cliente e todos os seus empreendimentos?"
          :excluindo="excluindoId === cliente.id"
          @editar="
            $router.push({
              name: 'cliente-detalhe',
              params: { id: cliente.id },
              query: { aba: 'dados' },
            })
          "
          @excluir="handleExcluir(cliente)"
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
import * as clienteService from '@/services/clienteService'

const lista = useListaBuscavel(
  (termo) => clienteService.listarTodos(termo),
  'Não foi possível carregar os clientes.',
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
    await clienteService.criar({ nome: nome.value })
    sucesso.value = `Cliente "${nome.value}" adicionado com sucesso.`
    nome.value = ''
    await lista.carregar()
  } catch (error) {
    erro.value = error.response?.data?.mensagem ?? 'Não foi possível adicionar o cliente.'
  } finally {
    criando.value = false
  }
}

async function handleExcluir(cliente) {
  erro.value = ''
  sucesso.value = ''
  excluindoId.value = cliente.id

  try {
    await clienteService.excluir(cliente.id)
    sucesso.value = `Cliente "${cliente.nome}" excluída com seus empreendimentos.`
    await lista.carregar()
  } catch (error) {
    erro.value = error.response?.data?.mensagem ?? 'Não foi possível excluir o cliente.'
  } finally {
    excluindoId.value = null
  }
}

onMounted(lista.carregar)
</script>
