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
            <th>Alteração</th>
            <th>Registro</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="revisao in lista.itens" :key="revisao.revisao">
            <tr v-for="(alteracao, i) in revisao.alteracoes" :key="i">
              <td v-if="i === 0" :rowspan="revisao.alteracoes.length">
                {{ formatarDataHora(revisao.dataOperacao) }}
              </td>
              <td v-if="i === 0" :rowspan="revisao.alteracoes.length">
                {{ revisao.usuarioNome ?? '—' }}
                <small v-if="revisao.usuarioEmail" class="linha-secundaria">
                  {{ revisao.usuarioEmail }}
                </small>
              </td>
              <td>
                <span class="badge" :class="`acao-${alteracao.acao.toLowerCase()}`">
                  {{ ACOES_AUDITORIA[alteracao.acao] ?? alteracao.acao }}
                </span>
                <small v-for="campo in alteracao.campos" :key="campo" class="linha-secundaria">
                  {{ campo }}
                </small>
              </td>
              <td>
                {{ alteracao.tipo }}
                <small v-if="alteracao.nome" class="linha-secundaria">{{ alteracao.nome }}</small>
              </td>
            </tr>

            <tr v-if="!revisao.alteracoes.length">
              <td>{{ formatarDataHora(revisao.dataOperacao) }}</td>
              <td>
                {{ revisao.usuarioNome ?? '—' }}
                <small v-if="revisao.usuarioEmail" class="linha-secundaria">
                  {{ revisao.usuarioEmail }}
                </small>
              </td>
              <td>—</td>
              <td>—</td>
            </tr>
          </template>
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
import { ACOES_AUDITORIA } from '@/constants/opcoes'

const lista = useListaBuscavel(
  (termo) => auditoriaService.linhaDoTempo(termo),
  'Não foi possível carregar a auditoria.',
)

function formatarDataHora(valor) {
  return valor ? new Date(valor).toLocaleString('pt-BR') : '—'
}

onMounted(lista.carregar)
</script>

