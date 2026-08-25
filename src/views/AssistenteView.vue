<template>
  <AppLayout title="Assistente IA">
    <p v-if="!configurado && !carregandoStatus" class="msg erro">
      A chave da API do Claude não está configurada no servidor. Defina a variável de ambiente
      ANTHROPIC_API_KEY e reinicie a aplicação.
    </p>

    <div class="assistente">
      <aside class="assistente-lista card">
        <div class="card-header">
          <h2>Conversas</h2>
          <button type="button" class="btn-link" @click="iniciarNovaConversa">Nova</button>
        </div>

        <p v-if="carregandoConversas" class="subtitle">Carregando...</p>

        <p v-else-if="!conversas.length" class="subtitle">Nenhuma conversa ainda.</p>

        <ul v-else class="conversa-lista">
          <li v-for="conversa in conversas" :key="conversa.id">
            <button
              type="button"
              class="conversa-item"
              :class="{ ativa: conversaAtual?.conversa.id === conversa.id }"
              @click="abrirConversa(conversa.id)"
            >
              <strong>{{ conversa.titulo }}</strong>
              <span v-if="conversa.empreendimentoNome">{{ conversa.empreendimentoNome }}</span>
            </button>
            <button
              type="button"
              class="btn-link perigo"
              title="Excluir conversa"
              @click="handleExcluirConversa(conversa)"
            >
              Excluir
            </button>
          </li>
        </ul>
      </aside>

      <section class="assistente-chat card">
        <div v-if="conversaAtual" class="card-header">
          <div>
            <h2>{{ conversaAtual.conversa.titulo }}</h2>
            <p v-if="conversaAtual.conversa.empreendimentoNome" class="subtitle">
              Contexto: {{ conversaAtual.conversa.empreendimentoNome }}
            </p>
          </div>
        </div>

        <template v-else>
          <h2>Nova conversa</h2>
          <p class="subtitle">
            Tire dúvidas sobre dimensionamento e normas. Escolha um empreendimento para que o
            assistente enxergue os dados e os cálculos já salvos dele.
          </p>

          <div class="form-linha">
            <div class="field">
              <label for="empresa">Empresa (opcional)</label>
              <select id="empresa" v-model="empresaSelecionada" @change="carregarEmpreendimentos">
                <option :value="null">Sem contexto de projeto</option>
                <option v-for="empresa in empresas" :key="empresa.id" :value="empresa.id">
                  {{ empresa.nome }}
                </option>
              </select>
            </div>

            <div class="field">
              <label for="empreendimento">Empreendimento</label>
              <select
                id="empreendimento"
                v-model="empreendimentoSelecionado"
                :disabled="!empresaSelecionada"
              >
                <option :value="null">Nenhum</option>
                <option v-for="item in empreendimentos" :key="item.id" :value="item.id">
                  {{ item.nome }}
                </option>
              </select>
            </div>
          </div>
        </template>

        <div ref="painelMensagens" class="mensagens">
          <div
            v-for="mensagem in conversaAtual?.mensagens ?? []"
            :key="mensagem.id"
            class="mensagem"
            :class="mensagem.papel === 'USUARIO' ? 'do-usuario' : 'do-assistente'"
          >
            <span>{{ mensagem.papel === 'USUARIO' ? 'Você' : 'Assistente' }}</span>
            <p>{{ mensagem.conteudo }}</p>
          </div>

          <div v-if="enviando" class="mensagem do-assistente">
            <span>Assistente</span>
            <p class="pensando">Pensando...</p>
          </div>
        </div>

        <p v-if="erro" class="msg erro">{{ erro }}</p>

        <form class="assistente-envio" @submit.prevent="handleEnviar">
          <textarea
            v-model="pergunta"
            rows="3"
            maxlength="4000"
            placeholder="Ex.: qual o diâmetro mínimo do ramal de descarga de um vaso sanitário?"
            :disabled="enviando || !configurado"
            @keydown.enter.exact.prevent="handleEnviar"
          ></textarea>
          <button type="submit" :disabled="enviando || !configurado || !pergunta.trim()">
            {{ enviando ? 'Enviando...' : 'Enviar' }}
          </button>
        </form>
      </section>
    </div>
  </AppLayout>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import * as assistenteService from '@/services/assistenteService'
import * as empresaService from '@/services/empresaService'
import * as empreendimentoService from '@/services/empreendimentoService'

const conversas = ref([])
const conversaAtual = ref(null)
const pergunta = ref('')
const erro = ref('')

const carregandoStatus = ref(true)
const carregandoConversas = ref(false)
const enviando = ref(false)
const configurado = ref(true)

const empresas = ref([])
const empreendimentos = ref([])
const empresaSelecionada = ref(null)
const empreendimentoSelecionado = ref(null)

const painelMensagens = ref(null)

async function rolarParaFim() {
  await nextTick()
  const painel = painelMensagens.value
  if (painel) {
    painel.scrollTop = painel.scrollHeight
  }
}

async function carregarStatus() {
  carregandoStatus.value = true
  try {
    configurado.value = (await assistenteService.status()).configurado
  } catch {
    configurado.value = false
  } finally {
    carregandoStatus.value = false
  }
}

async function carregarConversas() {
  carregandoConversas.value = true
  try {
    conversas.value = await assistenteService.listarConversas()
  } catch {
    erro.value = 'Não foi possível carregar as conversas.'
  } finally {
    carregandoConversas.value = false
  }
}

async function carregarEmpresas() {
  try {
    empresas.value = await empresaService.listarTodas()
  } catch {
    // Sem a lista o assistente segue funcionando, apenas sem contexto de projeto.
    empresas.value = []
  }
}

async function carregarEmpreendimentos() {
  empreendimentoSelecionado.value = null
  empreendimentos.value = []

  if (!empresaSelecionada.value) return

  try {
    empreendimentos.value = await empreendimentoService.listarPorEmpresa(empresaSelecionada.value)
  } catch {
    empreendimentos.value = []
  }
}

function iniciarNovaConversa() {
  conversaAtual.value = null
  pergunta.value = ''
  erro.value = ''
  empresaSelecionada.value = null
  empreendimentoSelecionado.value = null
  empreendimentos.value = []
}

async function abrirConversa(id) {
  erro.value = ''
  try {
    conversaAtual.value = await assistenteService.buscarConversa(id)
    await rolarParaFim()
  } catch {
    erro.value = 'Não foi possível abrir a conversa.'
  }
}

async function handleEnviar() {
  const texto = pergunta.value.trim()
  if (!texto || enviando.value) return

  erro.value = ''
  enviando.value = true
  pergunta.value = ''

  try {
    if (conversaAtual.value) {
      // Mostra a pergunta imediatamente; a resposta chega depois da chamada à API.
      conversaAtual.value.mensagens.push({
        id: `local-${Date.now()}`,
        papel: 'USUARIO',
        conteudo: texto,
      })
      await rolarParaFim()

      const resposta = await assistenteService.enviarMensagem(conversaAtual.value.conversa.id, {
        mensagem: texto,
      })
      conversaAtual.value.mensagens.push(resposta)
    } else {
      conversaAtual.value = await assistenteService.criarConversa({
        mensagem: texto,
        empreendimentoId: empreendimentoSelecionado.value,
      })
    }

    await carregarConversas()
    await rolarParaFim()
  } catch (error) {
    erro.value = error.response?.data?.mensagem ?? 'Não foi possível falar com o assistente.'
    pergunta.value = texto
    if (conversaAtual.value) {
      // Remove a pergunta otimista que não chegou a ser respondida.
      conversaAtual.value.mensagens = conversaAtual.value.mensagens.filter(
        (mensagem) => !String(mensagem.id).startsWith('local-'),
      )
    }
  } finally {
    enviando.value = false
  }
}

async function handleExcluirConversa(conversa) {
  erro.value = ''
  try {
    await assistenteService.excluirConversa(conversa.id)
    if (conversaAtual.value?.conversa.id === conversa.id) {
      iniciarNovaConversa()
    }
    await carregarConversas()
  } catch {
    erro.value = 'Não foi possível excluir a conversa.'
  }
}

onMounted(async () => {
  await Promise.all([carregarStatus(), carregarConversas(), carregarEmpresas()])
})
</script>
