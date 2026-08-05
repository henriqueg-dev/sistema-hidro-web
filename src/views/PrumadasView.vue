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
      error.response?.data?.mensagem ?? 'Nenhuma configuração encontrada para os parâmetros informados.'
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

      <div v-if="resultado" class="resultado">
        <div class="resultado-item">
          <span>Tipo</span>
          <strong>{{ resultado.tipo }}</strong>
        </div>
        <div class="resultado-item">
          <span>Faixa de pavimentos</span>
          <strong>{{ resultado.numPavimentos }}</strong>
        </div>
        <div class="resultado-item">
          <span>Desconector</span>
          <strong>{{ resultado.desconector }}</strong>
        </div>
        <div class="resultado-item">
          <span>Condição da sanca</span>
          <strong>{{ resultado.condicaoSanca }}</strong>
        </div>
        <div class="resultado-item full">
          <span>Descrição</span>
          <p>{{ resultado.descricao }}</p>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="list-header">
        <h2>Listar prumadas por tipo</h2>
        <div class="filtro-lista">
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

<style scoped>
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1.75rem;
  box-shadow: var(--shadow-sm);
  margin-bottom: 1.5rem;
}

.card h2 {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 0.85rem;
  margin-bottom: 1.25rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field.actions {
  grid-column: 1 / -1;
  justify-content: flex-end;
  align-items: flex-end;
}

label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text);
}

input,
select {
  padding: 0.6rem 0.75rem;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.9rem;
  background: var(--color-bg);
  color: var(--color-text);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
  background: var(--color-surface);
}

button {
  padding: 0.65rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
  white-space: nowrap;
}

button:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.msg {
  margin-top: 1rem;
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
  font-size: 0.85rem;
}

.msg.erro {
  color: var(--color-danger);
  background: var(--color-danger-light);
}

.resultado {
  margin-top: 1.25rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem 1.5rem;
  padding: 1.25rem;
  background: var(--color-primary-light);
  border-radius: 8px;
}

.resultado-item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.resultado-item.full {
  grid-column: 1 / -1;
}

.resultado-item span {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 600;
  text-transform: uppercase;
}

.resultado-item strong {
  font-size: 0.95rem;
  color: var(--color-text);
}

.resultado-item p {
  font-size: 0.9rem;
  color: var(--color-text);
  line-height: 1.4;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.list-header h2 {
  margin-bottom: 0;
}

.filtro-lista {
  display: flex;
  gap: 0.5rem;
}

.filtro-lista select {
  min-width: 140px;
}

.tabela {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.tabela th {
  text-align: left;
  padding: 0.6rem 0.5rem;
  color: var(--color-text-muted);
  font-weight: 600;
  border-bottom: 1.5px solid var(--color-border);
}

.tabela td {
  padding: 0.65rem 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

@media (max-width: 640px) {
  .form-grid,
  .resultado {
    grid-template-columns: 1fr;
  }

  .field.actions {
    align-items: stretch;
  }
}
</style>
