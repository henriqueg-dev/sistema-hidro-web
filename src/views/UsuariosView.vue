<template>
  <AppLayout title="Gerenciar usuários">
    <section class="card">
      <h2>Criar nova conta</h2>
      <p class="subtitle">Somente administradores podem cadastrar novos acessos.</p>

      <form class="form-grid" @submit.prevent="handleCriar">
        <div class="field">
          <label for="nome">Nome</label>
          <input id="nome" v-model="form.nome" type="text" required placeholder="Nome completo" />
        </div>

        <div class="field">
          <label for="email">E-mail</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            placeholder="voce@empresa.com"
          />
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

    <section class="card">
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
            <td>
              <span class="badge">{{ usuario.perfil }}</span>
            </td>
            <td>
              <span class="status" :class="usuario.ativo ? 'ativo' : 'inativo'">
                {{ usuario.ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
            <td class="acoes">
              <button class="btn-link" @click="alternarStatus(usuario)">
                {{ usuario.ativo ? 'Desativar' : 'Ativar' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </AppLayout>
</template>

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
