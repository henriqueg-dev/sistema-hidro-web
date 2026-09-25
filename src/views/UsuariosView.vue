<template>
  <AppLayout :title="ehAdmin ? 'Gerenciar usuários' : 'Minha conta'">
    <template v-if="ehAdmin">
      <section class="card">
        <h2>Convidar engenheiro</h2>
        <p class="subtitle">
          Enviamos um e-mail com um código para a pessoa definir a própria senha.
        </p>

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
            <label for="perfil">Perfil</label>
            <select id="perfil" v-model="form.perfil">
              <option v-for="(rotulo, valor) in PERFIS" :key="valor" :value="valor">
                {{ rotulo }}
              </option>
            </select>
          </div>

          <div class="field actions">
            <button type="submit" :disabled="criando">
              {{ criando ? 'Enviando...' : 'Enviar convite' }}
            </button>
          </div>
        </form>

        <p v-if="erro" class="msg erro">{{ erro }}</p>
        <p v-if="sucesso" class="msg sucesso">{{ sucesso }}</p>
      </section>

      <section class="card">
        <h2>Usuários cadastrados</h2>
        <p class="subtitle">Cada engenheiro define a própria senha ao aceitar o convite.</p>

        <p v-if="carregandoLista" class="subtitle">Carregando...</p>
        <p v-else-if="!usuarios.length" class="subtitle">Nenhum usuário cadastrado ainda.</p>

        <div v-else class="tabela-rolagem">
          <table class="tabela">
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
                  <span class="badge">{{ PERFIS[usuario.perfil] ?? usuario.perfil }}</span>
                </td>
                <td>
                  <span
                    class="status"
                    :class="usuario.ativo ? 'ativo' : usuario.convitePendente ? 'aviso' : 'inativo'"
                  >
                    {{
                      usuario.ativo ? 'Ativo' : usuario.convitePendente ? 'Convite pendente' : 'Inativo'
                    }}
                  </span>
                </td>
                <td class="acoes">
                  <button
                    v-if="usuario.convitePendente"
                    class="btn-link"
                    :disabled="reenviando === usuario.id"
                    @click="handleReenviarConvite(usuario)"
                  >
                    {{ reenviando === usuario.id ? 'Reenviando...' : 'Reenviar convite' }}
                  </button>
                  <button
                    v-else
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
        </div>

        <p v-if="erroStatus" class="msg erro">{{ erroStatus }}</p>
      </section>
    </template>

    <section class="card">
      <h2>Meus dados</h2>
      <p class="subtitle">Estes são os dados do seu acesso ao sistema.</p>

      <div class="painel em-linha">
        <div class="painel-item">
          <span>Nome</span>
          <strong>{{ authStore.nome }}</strong>
        </div>
        <div class="painel-item amplo">
          <span>E-mail</span>
          <strong>{{ authStore.email }}</strong>
        </div>
        <div class="painel-item">
          <span>Perfil</span>
          <strong>{{ PERFIS[authStore.perfil] ?? authStore.perfil }}</strong>
        </div>
      </div>

      <h2 class="titulo-secundario">Alterar minha senha</h2>

      <form v-if="faseSenha === 'form'" class="form-linha" @submit.prevent="handleSolicitarAlteracaoSenha">
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
            {{ salvandoSenha ? 'Enviando...' : 'Enviar código' }}
          </button>
        </div>
      </form>

      <form v-else class="form-linha" @submit.prevent="handleConfirmarAlteracaoSenha">
        <div class="field amplo">
          <label for="codigo-senha">Código recebido por e-mail</label>
          <input
            id="codigo-senha"
            v-model="codigoSenha"
            type="text"
            inputmode="numeric"
            maxlength="6"
            placeholder="000000"
            required
          />
        </div>

        <div class="field actions">
          <button type="submit" :disabled="salvandoSenha">
            {{ salvandoSenha ? 'Salvando...' : 'Confirmar alteração' }}
          </button>
          <button
            type="button"
            class="btn-secundario"
            :disabled="salvandoSenha"
            @click="cancelarAlteracaoSenha"
          >
            Cancelar
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

const faseSenha = ref('form')
const senhaAtual = ref('')
const novaSenha = ref('')
const codigoSenha = ref('')
const salvandoSenha = ref(false)
const erroSenha = ref('')
const sucessoSenha = ref('')

const form = ref({ nome: '', email: '', perfil: 'ENGENHEIRO' })
const criando = ref(false)
const erro = ref('')
const sucesso = ref('')
const reenviando = ref(null)

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
    sucesso.value = `Convite enviado para ${form.value.email}.`
    form.value = { nome: '', email: '', perfil: 'ENGENHEIRO' }
    await carregarUsuarios()
  } catch (error) {
    erro.value = error.response?.data?.mensagem ?? 'Não foi possível enviar o convite.'
  } finally {
    criando.value = false
  }
}

async function handleReenviarConvite(usuario) {
  erroStatus.value = ''
  reenviando.value = usuario.id

  try {
    await usuarioService.reenviarConvite(usuario.id)
  } catch (error) {
    erroStatus.value = error.response?.data?.mensagem ?? 'Não foi possível reenviar o convite.'
  } finally {
    reenviando.value = null
  }
}

async function handleSolicitarAlteracaoSenha() {
  erroSenha.value = ''
  sucessoSenha.value = ''
  salvandoSenha.value = true

  try {
    await usuarioService.solicitarAlteracaoSenha(senhaAtual.value)
    faseSenha.value = 'codigo'
  } catch (error) {
    erroSenha.value = error.response?.data?.mensagem ?? 'Não foi possível enviar o código.'
  } finally {
    salvandoSenha.value = false
  }
}

async function handleConfirmarAlteracaoSenha() {
  erroSenha.value = ''
  sucessoSenha.value = ''
  salvandoSenha.value = true

  try {
    await usuarioService.confirmarAlteracaoSenha(codigoSenha.value, novaSenha.value)
    sucessoSenha.value = 'Senha alterada com sucesso.'
    cancelarAlteracaoSenha()
  } catch (error) {
    erroSenha.value = error.response?.data?.mensagem ?? 'Código inválido ou expirado.'
  } finally {
    salvandoSenha.value = false
  }
}

function cancelarAlteracaoSenha() {
  faseSenha.value = 'form'
  senhaAtual.value = ''
  novaSenha.value = ''
  codigoSenha.value = ''
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
