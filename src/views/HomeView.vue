<template>
  <AppLayout :title="`Olá, ${primeiroNome}`">
    <p class="subtitle">
      {{ authStore.nomeEscritorio || 'Seu escritório' }} ·
      {{ PERFIS[authStore.perfil] ?? authStore.perfil }}
    </p>

    <p v-if="erro" class="msg erro">{{ erro }}</p>
    <p v-else-if="!painel" class="subtitle">Carregando...</p>

    <template v-else>
      <div class="indicadores">
        <RouterLink to="/clientes" class="indicador">
          <span>Clientes</span>
          <strong>{{ painel.clientes }}</strong>
          <small>cadastrados</small>
        </RouterLink>

        <RouterLink to="/clientes" class="indicador">
          <span>Empreendimentos</span>
          <strong>{{ painel.empreendimentos }}</strong>
          <small>ativos</small>
        </RouterLink>

        <div class="indicador">
          <span>Cálculos salvos</span>
          <strong>{{ totalCalculos }}</strong>
          <small>{{ tiposUsados }} de {{ painel.calculos.length }} tipos em uso</small>
        </div>

        <template v-if="painel.orcamentos">
          <RouterLink to="/orcamentos" class="indicador">
            <span>Orçamentos enviados</span>
            <strong>{{ formatarReais(painel.orcamentos.valorEnviados) }}</strong>
            <small>{{ painel.orcamentos.enviados }} aguardando resposta</small>
          </RouterLink>

          <RouterLink to="/orcamentos" class="indicador">
            <span>Orçamentos aprovados</span>
            <strong>{{ formatarReais(painel.orcamentos.valorAprovados) }}</strong>
            <small>{{ plural(painel.orcamentos.aprovados, 'orçamento', 'orçamentos') }}</small>
          </RouterLink>
        </template>
      </div>

      <p v-if="painel.orcamentos?.vencidos" class="msg aviso">
        {{ plural(painel.orcamentos.vencidos, 'orçamento passou', 'orçamentos passaram') }} da
        validade sem resposta.
        <RouterLink to="/orcamentos">Revisar orçamentos</RouterLink>
      </p>

      <div class="painel-colunas">
        <section class="card">
          <h2>Cálculos por tipo</h2>
          <p class="subtitle">Salvos em empreendimentos ativos.</p>

          <div v-if="!totalCalculos" class="estado-vazio">
            <strong>Nenhum cálculo salvo ainda</strong>
            <span>Abra um empreendimento e escolha um cálculo na aba Cálculos.</span>
          </div>

          <ul v-else class="barras">
            <li
              v-for="calculo in painel.calculos"
              :key="calculo.nome"
              :title="`${calculo.nome}: ${calculo.quantidade}`"
            >
              <span class="barras-rotulo">{{ calculo.nome }}</span>
              <span class="barras-trilho" aria-hidden="true">
                <span class="barras-valor" :style="{ width: largura(calculo.quantidade) }"></span>
              </span>
              <strong>{{ calculo.quantidade }}</strong>
            </li>
          </ul>
        </section>

        <section class="card">
          <h2>Empreendimentos recentes</h2>
          <p class="subtitle">Os últimos cadastrados, para voltar direto a eles.</p>

          <p v-if="!painel.empreendimentosRecentes.length" class="subtitle">
            Nenhum empreendimento cadastrado ainda.
          </p>

          <ul v-else class="lista-links">
            <li v-for="empreendimento in painel.empreendimentosRecentes" :key="empreendimento.id">
              <RouterLink
                :to="{ name: 'empreendimento-detalhe', params: { id: empreendimento.id } }"
              >
                <strong>{{ empreendimento.nome }}</strong>
                <span>
                  {{ empreendimento.clienteNome }} ·
                  {{ TIPOS_EMPREENDIMENTO[empreendimento.tipo] ?? empreendimento.tipo }} ·
                  {{ empreendimento.numPavimentos }} pav.
                </span>
              </RouterLink>
            </li>
          </ul>
        </section>
      </div>

      <section v-if="painel.ultimasAlteracoes" class="card">
        <div class="card-header">
          <div class="card-header-titulo">
            <h2>Últimas alterações</h2>
            <p class="subtitle">Registradas pela auditoria.</p>
          </div>
          <RouterLink to="/auditoria" class="btn-link">Ver auditoria completa</RouterLink>
        </div>

        <p v-if="!painel.ultimasAlteracoes.length" class="subtitle">
          Nenhuma alteração registrada.
        </p>

        <div v-else class="tabela-rolagem">
          <table class="tabela">
            <thead>
              <tr>
                <th>Quando</th>
                <th>Usuário</th>
                <th>Alteração</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="revisao in painel.ultimasAlteracoes" :key="revisao.revisao">
                <td>{{ formatarDataHora(revisao.dataOperacao) }}</td>
                <td>{{ revisao.usuarioNome ?? '—' }}</td>
                <td>
                  <span v-if="!revisao.alteracoes.length">—</span>
                  <span
                    v-for="(alteracao, i) in revisao.alteracoes"
                    :key="i"
                    class="linha-alteracao"
                  >
                    <span class="badge" :class="`acao-${alteracao.acao.toLowerCase()}`">
                      {{ ACOES_AUDITORIA[alteracao.acao] ?? alteracao.acao }}
                    </span>
                    {{ alteracao.tipo }}<template v-if="alteracao.nome">: {{ alteracao.nome }}</template>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/AppLayout.vue'
import * as painelService from '@/services/painelService'
import { PERFIS, TIPOS_EMPREENDIMENTO, ACOES_AUDITORIA } from '@/constants/opcoes'
import { formatarDataHora, formatarReais } from '@/utils/formato'

const authStore = useAuthStore()

const painel = ref(null)
const erro = ref('')

const primeiroNome = computed(() => authStore.nome?.split(' ')[0] ?? '')

const totalCalculos = computed(() =>
  painel.value.calculos.reduce((total, calculo) => total + calculo.quantidade, 0),
)

const tiposUsados = computed(() => painel.value.calculos.filter((c) => c.quantidade).length)

// A maior barra ocupa o trilho inteiro; as demais são proporcionais a ela.
function largura(quantidade) {
  const maior = Math.max(...painel.value.calculos.map((c) => c.quantidade))
  return maior ? `${(quantidade / maior) * 100}%` : '0%'
}

function plural(quantidade, singular, pluralTexto) {
  return `${quantidade} ${quantidade === 1 ? singular : pluralTexto}`
}

onMounted(async () => {
  try {
    painel.value = await painelService.buscar()
  } catch {
    erro.value = 'Não foi possível carregar os indicadores.'
  }
})
</script>
