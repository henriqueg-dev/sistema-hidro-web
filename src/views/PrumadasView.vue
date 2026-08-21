<template>
  <AppLayout title="Prumadas">
    <CalculoPrumada
      titulo="Consultar configuração normativa"
      descricao="Informe os parâmetros para encontrar a prumada recomendada."
      rotulo-acao="Consultar"
      rotulo-aguardando="Consultando..."
    />

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
import CalculoPrumada from '@/components/calculos/CalculoPrumada.vue'
import * as prumadaService from '@/services/prumadaService'
import { TIPOS_PRUMADA } from '@/constants/opcoes'

const tipoLista = ref('COZINHA')
const listaPrumadas = ref([])
const carregandoLista = ref(false)
const erroLista = ref('')
const buscouLista = ref(false)

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
