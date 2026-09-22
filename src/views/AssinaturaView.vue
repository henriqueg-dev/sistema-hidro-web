<template>
  <AppLayout title="Assinatura">
    <div class="card" v-if="assinatura">
      <h2>Status atual</h2>
      <div class="painel em-linha">
        <div class="painel-item">
          <span>Plano</span>
          <strong>{{ assinatura.plano ? rotuloPlano(assinatura.plano) : 'Nenhum plano escolhido' }}</strong>
        </div>
        <div class="painel-item">
          <span>Situação</span>
          <strong class="status" :class="classeStatus(assinatura.status)">
            {{ rotuloStatus(assinatura.status) }}
          </strong>
        </div>
        <div class="painel-item" v-if="assinatura.expiraEm">
          <span>Válida até</span>
          <strong>{{ formatarData(assinatura.expiraEm) }}</strong>
        </div>
      </div>
    </div>

    <div class="card" v-if="cobranca">
      <h2>Pague com PIX para ativar</h2>
      <p class="subtitle">Escaneie o QR code ou copie o código abaixo no app do seu banco.</p>
      <img class="pix-qrcode" :src="cobranca.brCodeBase64" alt="QR code PIX" />
      <div class="form-linha">
        <input class="field amplo" type="text" readonly :value="cobranca.brCode" />
        <button type="button" class="btn-link" @click="copiarCodigo">Copiar código</button>
      </div>
      <p class="texto-secundario">
        Assim que o pagamento for confirmado, a assinatura é ativada automaticamente — clique em
        "Já paguei" para atualizar.
      </p>
      <button type="button" @click="carregarStatus">Já paguei, atualizar status</button>
    </div>

    <div class="card" v-else-if="ehAdmin">
      <h2>Escolha um plano</h2>
      <p class="subtitle">
        Cálculos, orçamentos e memoriais em PDF são ilimitados em todos os planos.
      </p>

      <div class="planos-grade">
        <div v-for="plano in planos" :key="plano.valor" class="card plano-card">
          <h2>{{ plano.nome }}</h2>
          <p class="plano-preco">{{ formatarPreco(plano.precoCentavos) }}<span>/mês</span></p>
          <ul class="plano-lista">
            <li>{{ plano.usuarios }}</li>
            <li>{{ plano.assistente }}</li>
          </ul>
          <button type="button" :disabled="gerando" @click="handleGerarCobranca(plano.valor)">
            {{ gerando ? 'Gerando...' : 'Assinar' }}
          </button>
        </div>
      </div>
    </div>

    <div class="card" v-else>
      <p class="msg aviso">
        A assinatura do escritório está {{ rotuloStatus(assinatura?.status).toLowerCase() }}.
        Peça para um administrador regularizar o pagamento.
      </p>
    </div>

    <p v-if="erro" class="msg erro">{{ erro }}</p>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import * as assinaturaService from '@/services/assinaturaService'

const PLANOS = [
  {
    valor: 'STARTER',
    nome: 'Starter',
    precoCentavos: 4900,
    usuarios: 'Até 2 usuários',
    assistente: 'Sem assistente de IA',
  },
  {
    valor: 'PROFISSIONAL',
    nome: 'Profissional',
    precoCentavos: 9900,
    usuarios: 'Até 5 usuários',
    assistente: 'Assistente de IA — 300 mensagens/mês',
  },
  {
    valor: 'ESCRITORIO',
    nome: 'Escritório',
    precoCentavos: 19900,
    usuarios: 'Usuários ilimitados',
    assistente: 'Assistente de IA ilimitado',
  },
]

const authStore = useAuthStore()
const ehAdmin = computed(() => authStore.perfil === 'ADMIN')

const assinatura = ref(null)
const cobranca = ref(null)
const erro = ref('')
const gerando = ref(false)
const planos = PLANOS

onMounted(carregarStatus)

async function carregarStatus() {
  erro.value = ''
  try {
    assinatura.value = await assinaturaService.statusAtual()
    if (assinatura.value.status === 'ATIVA') {
      cobranca.value = null
    }
  } catch (error) {
    erro.value = error.response?.data?.mensagem ?? 'Não foi possível carregar a assinatura.'
  }
}

async function handleGerarCobranca(plano) {
  erro.value = ''
  gerando.value = true
  try {
    cobranca.value = await assinaturaService.gerarCobranca(plano)
  } catch (error) {
    erro.value = error.response?.data?.mensagem ?? 'Não foi possível gerar a cobrança.'
  } finally {
    gerando.value = false
  }
}

function copiarCodigo() {
  navigator.clipboard?.writeText(cobranca.value.brCode)
}

function rotuloPlano(valor) {
  return planos.find((p) => p.valor === valor)?.nome ?? valor
}

function rotuloStatus(status) {
  return { ATIVA: 'Ativa', EXPIRADA: 'Vencida', PENDENTE: 'Pendente de pagamento' }[status] ?? status
}

function classeStatus(status) {
  return { ATIVA: 'ativo', EXPIRADA: 'vencido', PENDENTE: 'aviso' }[status] ?? ''
}

function formatarPreco(centavos) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarData(data) {
  return new Date(data).toLocaleDateString('pt-BR')
}
</script>
