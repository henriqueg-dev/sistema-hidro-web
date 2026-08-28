<template>
  <div class="layout" :class="{ 'menu-oculto': !menuAberto }">
    <aside class="sidebar">
      <div class="sidebar-topo">
        <RouterLink to="/" class="brand">
          <img class="brand-icon" src="@/assets/hidros-icone-app.png" alt="" />
          <span>Hidros</span>
        </RouterLink>

        <button
          type="button"
          class="menu-botao"
          title="Ocultar menu"
          aria-label="Ocultar menu"
          @click="alternarMenu(false)"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M15 5L8 12L15 19"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <nav class="nav-links">
        <RouterLink to="/clientes" class="nav-link">Clientes</RouterLink>
        <RouterLink to="/prumadas" class="nav-link">Prumadas</RouterLink>
        <RouterLink to="/assistente" class="nav-link">Assistente IA</RouterLink>
        <RouterLink to="/usuarios" class="nav-link">
          {{ authStore.perfil === 'ADMIN' ? 'Usuários' : 'Minha conta' }}
        </RouterLink>
      </nav>

      <div class="user-info">
        <div class="user-identidade">
          <div class="avatar">{{ authStore.nome?.[0]?.toUpperCase() }}</div>
          <div class="user-meta">
            <strong>{{ authStore.nome }}</strong>
            <span>{{ authStore.perfil }}</span>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout">Sair</button>
      </div>
    </aside>

    <button
      v-if="!menuAberto"
      type="button"
      class="menu-botao menu-abrir"
      title="Mostrar menu"
      aria-label="Mostrar menu"
      @click="alternarMenu(true)"
    >
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4 7H20M4 12H20M4 17H20"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </button>

    <main class="content">
      <h1 v-if="title" class="page-title">{{ title }}</h1>
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const CHAVE_MENU = 'menuAberto'

defineProps({
  title: { type: String, default: '' },
})

const authStore = useAuthStore()
const router = useRouter()

const menuAberto = ref(localStorage.getItem(CHAVE_MENU) !== 'false')

function alternarMenu(aberto) {
  menuAberto.value = aberto
  localStorage.setItem(CHAVE_MENU, String(aberto))
}

function handleLogout() {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>
