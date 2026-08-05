<script setup>
import { onMounted, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import * as usuarioService from '@/services/usuarioService'

const usuarios = ref([])
const carregandoLista = ref(false)

const form = ref({ nome: '', email: '', senha: '', perfil: 'ENGENHEIRO' })
const criando = ref(false)
const erro = ref('')
const sucesso = ref('')

async function carregarUsuarios() {
  carregandoLista.value = true
  try {
    usuarios.value = await usuarioService.listarTodos()
  } catch {
    erro.value = 'Não foi possível carregar os usuários.'
  } finally {
    carregandoLista.value = false
  }
}

async function handleCriar() {
  erro.value = ''
  sucesso.value = ''
  criando.value = true

  try {
    await usuarioService.criar(form.value)
    sucesso.value = `Conta de ${form.value.nome} criada com sucesso.`
    form.value = { nome: '', email: '', senha: '', perfil: 'ENGENHEIRO' }
    await carregarUsuarios()
  } catch (error) {
    erro.value = error.response?.data?.mensagem ?? 'Não foi possível criar a conta.'
  } finally {
    criando.value = false
  }
}

async function alternarStatus(usuario) {
  try {
    await usuarioService.alterarStatus(usuario.id, !usuario.ativo)
    await carregarUsuarios()
  } catch {
    erro.value = 'Não foi possível alterar o status do usuário.'
  }
}

onMounted(carregarUsuarios)
</script>

<template>
  <AppLayout title="Gerenciar usuários">
    <section class="create-card">
      <h2>Criar nova conta</h2>
      <p class="subtitle">Somente administradores podem cadastrar novos acessos.</p>

      <form class="form-grid" @submit.prevent="handleCriar">
        <div class="field">
          <label for="nome">Nome</label>
          <input id="nome" v-model="form.nome" type="text" required placeholder="Nome completo" />
        </div>

        <div class="field">
          <label for="email">E-mail</label>
          <input id="email" v-model="form.email" type="email" required placeholder="voce@empresa.com" />
        </div>

        <div class="field">
          <label for="senha">Senha</label>
          <input
            id="senha"
            v-model="form.senha"
            type="password"
            required
            minlength="6"
            placeholder="Senha provisória"
          />
        </div>

        <div class="field">
          <label for="perfil">Perfil</label>
          <select id="perfil" v-model="form.perfil">
            <option value="ENGENHEIRO">Engenheiro</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div class="field actions">
          <button type="submit" :disabled="criando">
            {{ criando ? 'Criando...' : 'Criar conta' }}
          </button>
        </div>
      </form>

      <p v-if="erro" class="msg erro">{{ erro }}</p>
      <p v-if="sucesso" class="msg sucesso">{{ sucesso }}</p>
    </section>

    <section class="list-card">
      <h2>Usuários cadastrados</h2>

      <p v-if="carregandoLista" class="subtitle">Carregando...</p>
      <p v-else-if="!usuarios.length" class="subtitle">Nenhum usuário cadastrado ainda.</p>

      <table v-else class="tabela">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Perfil</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usuario in usuarios" :key="usuario.id">
            <td>{{ usuario.nome }}</td>
            <td>{{ usuario.email }}</td>
            <td><span class="badge">{{ usuario.perfil }}</span></td>
            <td>
              <span class="status" :class="usuario.ativo ? 'ativo' : 'inativo'">
                {{ usuario.ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
            <td class="td-actions">
              <button class="link-btn" @click="alternarStatus(usuario)">
                {{ usuario.ativo ? 'Desativar' : 'Ativar' }}
              </button>
            </td>
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

button[type='submit'] {
  padding: 0.65rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
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

.badge {
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 0.78rem;
  font-weight: 600;
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

.td-actions {
  text-align: right;
}

.link-btn {
  border: none;
  background: none;
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
}

.link-btn:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .field.actions {
    align-items: stretch;
  }
}
</style>
