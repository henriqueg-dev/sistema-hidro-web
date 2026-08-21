<template>
  <section class="card">
    <h2>{{ titulo }}</h2>
    <p class="subtitle">{{ descricao }}</p>

    <form class="form-linha" @submit.prevent="handleConsultar">
      <div class="field amplo">
        <label for="tipo">Tipo</label>
        <select id="tipo" v-model="form.tipo">
          <option v-for="(rotulo, valor) in TIPOS_PRUMADA" :key="valor" :value="valor">
            {{ rotulo }}
          </option>
        </select>
      </div>

      <div class="field estreito">
        <label for="numPavimentos">Pavimentos</label>
        <input
          v-if="empreendimento"
          id="numPavimentos"
          :value="empreendimento.numPavimentos"
          type="number"
          disabled
        />
        <input
          v-else
          id="numPavimentos"
          v-model.number="form.numPavimentos"
          type="number"
          min="1"
          required
        />
      </div>

      <div class="field">
        <label for="desconector">Desconector</label>
        <select id="desconector" v-model="form.desconector">
          <option v-for="(rotulo, valor) in DESCONECTORES" :key="valor" :value="valor">
            {{ rotulo }}
          </option>
        </select>
      </div>

      <div class="field amplo">
        <label for="condicaoSanca">Condição da sanca</label>
        <select id="condicaoSanca" v-model="form.condicaoSanca">
          <option v-for="(rotulo, valor) in CONDICOES_SANCA" :key="valor" :value="valor">
            {{ rotulo }}
          </option>
        </select>
      </div>

      <div class="field actions">
        <button type="submit" :disabled="consultando">
          {{ consultando ? rotuloAguardando : rotuloAcao }}
        </button>
      </div>
    </form>

    <p v-if="erro" class="msg erro">{{ erro }}</p>

    <div v-if="resultado" class="painel">
      <div class="painel-item">
        <span>Tipo</span>
        <strong>{{ resultado.tipo }}</strong>
      </div>
      <div class="painel-item">
        <span>Faixa de pavimentos</span>
        <strong>{{ resultado.numPavimentos }}</strong>
      </div>
      <div class="painel-item">
        <span>Desconector</span>
        <strong>{{ resultado.desconector }}</strong>
      </div>
      <div class="painel-item">
        <span>Condição da sanca</span>
        <strong>{{ resultado.condicaoSanca }}</strong>
      </div>
      <div class="painel-item full">
        <span>Descrição</span>
        <p>{{ resultado.descricao }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import * as prumadaService from '@/services/prumadaService'
import { CONDICOES_SANCA, DESCONECTORES, TIPOS_PRUMADA } from '@/constants/opcoes'

const props = defineProps({
  // Ausente na tela de Prumadas, onde o número de pavimentos é digitado.
  empreendimento: { type: Object, default: null },
  titulo: { type: String, default: 'Prumada de esgoto' },
  descricao: {
    type: String,
    default: 'O número de pavimentos vem do empreendimento e define a faixa normativa aplicada.',
  },
  rotuloAcao: { type: String, default: 'Calcular' },
  rotuloAguardando: { type: String, default: 'Calculando...' },
})

const form = ref({
  tipo: 'COZINHA',
  numPavimentos: null,
  desconector: '50mm',
  condicaoSanca: 'SEM_SANCA',
})
const consultando = ref(false)
const erro = ref('')
const resultado = ref(null)

async function handleConsultar() {
  erro.value = ''
  resultado.value = null
  consultando.value = true

  try {
    resultado.value = await prumadaService.consultar({
      ...form.value,
      numPavimentos: props.empreendimento?.numPavimentos ?? form.value.numPavimentos,
    })
  } catch (error) {
    erro.value =
      error.response?.data?.mensagem ??
      'Nenhuma configuração encontrada para os parâmetros informados.'
  } finally {
    consultando.value = false
  }
}
</script>
