<template>
  <AppLayout title="Prumadas">
    <section class="card">
      <h2>Consultar configuração normativa</h2>
      <p class="subtitle">Informe os parâmetros para encontrar a prumada recomendada.</p>

      <form class="form-linha" @submit.prevent="handleConsultar">
        <div class="field amplo">
          <label for="tipo">Tipo</label>
          <select id="tipo" v-model="consultaForm.tipo">
            <option v-for="(rotulo, valor) in TIPOS_PRUMADA" :key="valor" :value="valor">
              {{ rotulo }}
            </option>
          </select>
        </div>

        <div class="field estreito">
          <label for="numPavimentos">Pavimentos</label>
          <input
            id="numPavimentos"
            v-model.number="consultaForm.numPavimentos"
            type="number"
            min="1"
            required
          />
        </div>

        <div class="field">
          <label for="desconector">Desconector</label>
          <select id="desconector" v-model="consultaForm.desconector">
            <option v-for="(rotulo, valor) in DESCONECTORES" :key="valor" :value="valor">
              {{ rotulo }}
            </option>
          </select>
        </div>

        <div class="field amplo">
          <label for="condicaoSanca">Condição da sanca</label>
          <select id="condicaoSanca" v-model="consultaForm.condicaoSanca">
            <option v-for="(rotulo, valor) in CONDICOES_SANCA" :key="valor" :value="valor">
              {{ rotulo }}
            </option>
          </select>
        </div>

        <div class="field actions">
          <button type="submit" :disabled="consultando">
            {{ consultando ? 'Consultando...' : 'Consultar' }}
          </button>
        </div>
      </form>

      <p v-if="erroConsulta" class="msg erro">{{ erroConsulta }}</p>

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

    <section class="card">
      <div class="card-header">
        <h2>Listar prumadas por tipo</h2>
        <div class="filtro-grupo">
          <select v-model="tipoLista">
            <option v-for="(rotulo, valor) in TIPOS_PRUMADA" :key="valor" :value="valor">
              {{ rotulo }}
            </option>
          </select>
          <button type="button" @click="handleListar" :disabled="carregandoLista">
            {{ carregandoLista ? 'Buscando...' : 'Buscar' }}
          </button>
        </div>
      </div>

      <p v-if="erroLista" class="msg erro">{{ erroLista }}</p>
      <p v-else-if="buscouLista && !carregandoLista && !listaPrumadas.length" class="subtitle">
        Nenhuma prumada ativa encontrada para esse tipo.
      </p>

      <table v-if="listaPrumadas.length" class="tabela">
        <thead>
          <tr>
            <th>Faixa de pavimentos</th>
            <th>Desconector</th>
            <th>Condição da sanca</th>
            <th>Descrição</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prumada in listaPrumadas" :key="prumada.id">
            <td>{{ prumada.numPavimentos }}</td>
            <td>{{ prumada.desconector }}</td>
            <td>{{ prumada.condicaoSanca }}</td>
            <td>{{ prumada.descricao }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </AppLayout>
</template>

<script setup>
import { ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import * as prumadaService from '@/services/prumadaService'
import { CONDICOES_SANCA, DESCONECTORES, TIPOS_PRUMADA } from '@/constants/opcoes'

const consultaForm = ref({
  tipo: 'COZINHA',
  numPavimentos: null,
  desconector: '50mm',
  condicaoSanca: 'SEM_SANCA',
})
const consultando = ref(false)
const erroConsulta = ref('')
const resultado = ref(null)

const tipoLista = ref('COZINHA')
const listaPrumadas = ref([])
const carregandoLista = ref(false)
const erroLista = ref('')
const buscouLista = ref(false)

async function handleConsultar() {
  erroConsulta.value = ''
  resultado.value = null
  consultando.value = true

  try {
    resultado.value = await prumadaService.consultar(consultaForm.value)
  } catch (error) {
    erroConsulta.value =
      error.response?.data?.mensagem ??
      'Nenhuma configuração encontrada para os parâmetros informados.'
  } finally {
    consultando.value = false
  }
}

async function handleListar() {
  erroLista.value = ''
  carregandoLista.value = true
  buscouLista.value = true

  try {
    listaPrumadas.value = await prumadaService.listarPorTipo(tipoLista.value)
  } catch {
    erroLista.value = 'Não foi possível carregar as prumadas.'
  } finally {
    carregandoLista.value = false
  }
}
</script>
