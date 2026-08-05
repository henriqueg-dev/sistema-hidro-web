<script setup>
import { onMounted, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import * as empresaService from '@/services/empresaService'

const empresas = ref([])
const carregandoLista = ref(false)

const nome = ref('')
const criando = ref(false)
const erro = ref('')
const sucesso = ref('')

async function carregarEmpresas() {
  carregandoLista.value = true
  try {
    empresas.value = await empresaService.listarTodas()
  } catch {
    erro.value = 'Não foi possível carregar as empresas.'
  } finally {
    carregandoLista.value = false
  }
}

async function handleCriar() {
  erro.value = ''
  sucesso.value = ''
  criando.value = true

  try {
    await empresaService.criar({ nome: nome.value })
    sucesso.value = `Empresa "${nome.value}" criada com sucesso.`
    nome.value = ''
    await carregarEmpresas()
  } catch (error) {
    erro.value = error.response?.data?.mensagem ?? 'Não foi possível criar a empresa.'
  } finally {
    criando.value = false
  }
}

onMounted(carregarEmpresas)
</script>

<template>
  <AppLayout title="Empresas">
    <section class="create-card">
      <h2>Nova empresa</h2>
      <form class="form-row" @submit.prevent="handleCriar">
        <div class="field">
          <label for="nome">Nome da empresa</label>
          <input id="nome" v-model="nome" type="text" required placeholder="Ex: Construtora Alfa" />
        </div>
        <button type="submit" :disabled="criando">
          {{ criando ? 'Criando...' : 'Adicionar' }}
        </button>
      </form>

      <p v-if="erro" class="msg erro">{{ erro }}</p>
      <p v-if="sucesso" class="msg sucesso">{{ sucesso }}</p>
    </section>

    <section class="list-card">
      <h2>Empresas cadastradas</h2>

      <p v-if="carregandoLista" class="subtitle">Carregando...</p>
      <p v-else-if="!empresas.length" class="subtitle">Nenhuma empresa cadastrada ainda.</p>

      <table v-else class="tabela">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Status</th>
            <th>Criada em</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="empresa in empresas" :key="empresa.id">
            <td>{{ empresa.nome }}</td>
            <td>
              <span class="status" :class="empresa.ativo ? 'ativo' : 'inativo'">
                {{ empresa.ativo ? 'Ativa' : 'Inativa' }}
              </span>
            </td>
            <td>{{ new Date(empresa.criadoEm).toLocaleDateString('pt-BR') }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </AppLayout>
</template>

<style scoped>
.create-card,
.list-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1.75rem;
  box-shadow: var(--shadow-sm);
  margin-bottom: 1.5rem;
}

.create-card h2,
.list-card h2 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
}

label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text);
}

input {
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

input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
  background: var(--color-surface);
}

button[type='submit'] {
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

button[type='submit']:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

button[type='submit']:disabled {
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

.msg.sucesso {
  color: var(--color-success);
  background: #f0fdf4;
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

.status {
  font-weight: 600;
  font-size: 0.82rem;
}

.status.ativo {
  color: var(--color-success);
}

.status.inativo {
  color: var(--color-danger);
}

@media (max-width: 560px) {
  .form-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
