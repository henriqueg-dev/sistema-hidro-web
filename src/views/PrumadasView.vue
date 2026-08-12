<template>
  <AppLayout title="Prumadas">
    <section class="card">
      <h2>Consultar configuração normativa</h2>
      <p class="subtitle">Informe os parâmetros para encontrar a prumada recomendada.</p>

      <form class="form-grid" @submit.prevent="handleConsultar">
        <div class="field">
          <label for="tipo">Tipo</label>
          <select id="tipo" v-model="consultaForm.tipo">
            <option value="COZINHA">Cozinha</option>
            <option value="ARS">ARS</option>
          </select>
        </div>

        <div class="field">
          <label for="numPavimentos">Número de pavimentos</label>
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
            <option value="50mm">50mm</option>
            <option value="75mm">75mm</option>
          </select>
        </div>

        <div class="field">
          <label for="condicaoSanca">Condição da sanca</label>
          <select id="condicaoSanca" v-model="consultaForm.condicaoSanca">
            <option value="SEM_SANCA">Sem sanca</option>
            <option value="ATE_1_2">Até 1,2m</option>
            <option value="ENTRE_1_2_E_1_8">Entre 1,2m e 1,8m</option>
            <option value="ACIMA_1_8">Acima de 1,8m</option>
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
            <option value="COZINHA">Cozinha</option>
            <option value="ARS">ARS</option>
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
