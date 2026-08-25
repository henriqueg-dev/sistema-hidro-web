<template>
  <AppLayout :title="ehAdmin ? 'Gerenciar usuários' : 'Minha conta'">
    <template v-if="ehAdmin">
      <section class="card">
        <h2>Criar nova conta</h2>
        <p class="subtitle">Somente administradores podem cadastrar novos acessos.</p>

        <form class="form-linha" @submit.prevent="handleCriar">
          <div class="field amplo">
            <label for="nome">Nome</label>
            <input id="nome" v-model="form.nome" type="text" required placeholder="Nome completo" />
          </div>

          <div class="field amplo">
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
            <label for="senha">Senha inicial</label>
            <input
              id="senha"
              v-model="form.senha"
              type="password"
              required
              minlength="8"
              placeholder="Mínimo de 8 caracteres"
            />
          </div>

          <div class="field">
            <label for="perfil">Perfil</label>
            <select id="perfil" v-model="form.perfil">
              <option v-for="(rotulo, valor) in PERFIS" :key="valor" :value="valor">
                {{ rotulo }}
              </option>
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
        <p class="subtitle">
          Cada usuário troca a própria senha; o administrador define apenas a senha inicial.
        </p>

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
                <button
                  class="btn-link"
                  :disabled="ehProprioUsuario(usuario) && usuario.ativo"
                  :title="
                    ehProprioUsuario(usuario) && usuario.ativo
                      ? 'Você não pode desativar a própria conta'
                      : ''
                  "
                  @click="alternarStatus(usuario)"
                >
                  {{ usuario.ativo ? 'Desativar' : 'Ativar' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-if="erroStatus" class="msg erro">{{ erroStatus }}</p>
      </section>
    </template>

    <section class="card">
      <h2>Meus dados</h2>
      <p class="subtitle">Estes são os dados do seu acesso ao sistema.</p>

      <table class="tabela">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Perfil</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ authStore.nome }}</td>
            <td>{{ authStore.email }}</td>
            <td>
              <span class="badge">{{ authStore.perfil }}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <h2 class="titulo-secundario">Alterar minha senha</h2>

      <form class="form-linha" @submit.prevent="handleAlterarMinhaSenha">
        <div class="field amplo">
          <label for="senha-atual">Senha atual</label>
          <input
            id="senha-atual"
            v-model="senhaAtual"
            type="password"
            required
            autocomplete="current-password"
          />
        </div>

        <div class="field amplo">
          <label for="senha-nova">Nova senha</label>
          <input
            id="senha-nova"
            v-model="novaSenha"
            type="password"
            required
            minlength="8"
            autocomplete="new-password"
            placeholder="Mínimo de 8 caracteres"
          />
        </div>

        <div class="field actions">
          <button type="submit" :disabled="salvandoSenha">
            {{ salvandoSenha ? 'Salvando...' : 'Alterar senha' }}
          </button>
        </div>
      </form>

      <p v-if="erroSenha" class="msg erro">{{ erroSenha }}</p>
      <p v-if="sucessoSenha" class="msg sucesso">{{ sucessoSenha }}</p>
    </section>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import * as usuarioService from '@/services/usuarioService'
import { PERFIS } from '@/constants/opcoes'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const ehAdmin = computed(() => authStore.perfil === 'ADMIN')

const usuarios = ref([])
const carregandoLista = ref(false)
const erroStatus = ref('')

const senhaAtual = ref('')
const novaSenha = ref('')
const salvandoSenha = ref(false)
const erroSenha = ref('')
const sucessoSenha = ref('')

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

async function handleAlterarMinhaSenha() {
  erroSenha.value = ''
  sucessoSenha.value = ''
  salvandoSenha.value = true

  try {
    await usuarioService.alterarMinhaSenha(senhaAtual.value, novaSenha.value)
    sucessoSenha.value = 'Senha alterada com sucesso.'
    senhaAtual.value = ''
    novaSenha.value = ''
  } catch (error) {
    erroSenha.value = error.response?.data?.mensagem ?? 'Não foi possível alterar a senha.'
  } finally {
    salvandoSenha.value = false
  }
}

function ehProprioUsuario(usuario) {
  return !!authStore.email && usuario.email === authStore.email
}

async function alternarStatus(usuario) {
  erroStatus.value = ''

  try {
    await usuarioService.alterarStatus(usuario.id, !usuario.ativo)
    await carregarUsuarios()
  } catch (error) {
    erroStatus.value =
      error.response?.data?.mensagem ?? 'Não foi possível alterar o status do usuário.'
  }
}

onMounted(() => {
  if (ehAdmin.value) {
    carregarUsuarios()
  }
})
</script>
