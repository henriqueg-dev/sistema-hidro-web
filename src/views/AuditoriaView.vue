<template>
  <AppLayout title="Auditoria">
    <p class="subtitle">
      Toda criação, alteração e exclusão registrada pelo sistema, da mais recente para a mais
      antiga, com o usuário responsável.
    </p>

    <section class="card">
      <div class="card-header">
        <div class="card-header-titulo">
          <h2>Alterações registradas</h2>
          <p class="subtitle">Últimas 200 alterações.</p>
        </div>

        <CampoBusca
          v-model="lista.busca"
          placeholder="Filtrar por usuário ou empreendimento..."
          :ocupado="lista.carregando"
          @buscar="lista.carregar()"
        />
      </div>

      <p v-if="lista.erro" class="msg erro">{{ lista.erro }}</p>
      <p v-else-if="lista.carregando" class="subtitle">Carregando...</p>
      <p v-else-if="!lista.itens.length && lista.busca" class="subtitle">
        Nenhuma alteração encontrada para "{{ lista.busca }}".
      </p>
      <p v-else-if="!lista.itens.length" class="subtitle">Nenhuma alteração registrada.</p>

      <table v-else class="tabela">
        <thead>
          <tr>
            <th>Quando</th>
            <th>Usuário</th>
            <th>O que foi alterado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="revisao in lista.itens" :key="revisao.revisao">
            <td>{{ formatarDataHora(revisao.dataOperacao) }}</td>
            <td>
              {{ revisao.usuarioNome ?? '—' }}
              <small v-if="revisao.usuarioEmail" class="linha-secundaria">
                {{ revisao.usuarioEmail }}
              </small>
            </td>
            <td>
              <span v-for="alteracao in revisao.alteracoes" :key="alteracao" class="badge">
                {{ alteracao }}
              </span>
              <span v-if="!revisao.alteracoes.length">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </AppLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import CampoBusca from '@/components/CampoBusca.vue'
import { useListaBuscavel } from '@/composables/useListaBuscavel'
import * as auditoriaService from '@/services/auditoriaService'

const lista = useListaBuscavel(
  (termo) => auditoriaService.linhaDoTempo(termo),
  'Não foi possível carregar a auditoria.',
)

function formatarDataHora(valor) {
  return valor ? new Date(valor).toLocaleString('pt-BR') : '—'
}

onMounted(lista.carregar)
</script>

