<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

defineProps({
  title: { type: String, default: '' },
})

const authStore = useAuthStore()
const router = useRouter()

function handleLogout() {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="layout">
    <header class="topbar">
      <RouterLink to="/" class="brand">
        <div class="brand-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C12 2 5 10.5 5 15.5C5 19.6421 8.35786 23 12.5 23C16.6421 23 20 19.6421 20 15.5C20 10.9 15 4.8 12 2Z"
              fill="white"
            />
          </svg>
        </div>
        <span>Sistema Hidro</span>
      </RouterLink>

      <nav class="nav-links">
        <RouterLink to="/empresas" class="nav-link">Empresas</RouterLink>
        <RouterLink to="/empreendimentos" class="nav-link">Empreendimentos</RouterLink>
        <RouterLink to="/prumadas" class="nav-link">Prumadas</RouterLink>
        <RouterLink v-if="authStore.perfil === 'ADMIN'" to="/usuarios" class="nav-link">
          Usuários
        </RouterLink>
      </nav>

      <div class="user-info">
        <div class="avatar">{{ authStore.nome?.[0]?.toUpperCase() }}</div>
        <div class="user-meta">
          <strong>{{ authStore.nome }}</strong>
          <span>{{ authStore.perfil }}</span>
        </div>
        <button class="logout-btn" @click="handleLogout">Sair</button>
      </div>
    </header>

    <main class="content">
      <h1 v-if="title" class="page-title">{{ title }}</h1>
      <slot />
    </main>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  background: var(--color-bg);
}

.topbar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.85rem 1.75rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  flex-wrap: wrap;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 700;
  color: var(--color-primary);
  font-size: 1.05rem;
  text-decoration: none;
}

.brand-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  border-radius: 9px;
  flex-shrink: 0;
}

.brand-icon svg {
  width: 17px;
  height: 17px;
}

.nav-links {
  display: flex;
  gap: 0.35rem;
  flex: 1;
  flex-wrap: wrap;
}

.nav-link {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.15s ease;
}

.nav-link:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.nav-link.router-link-active {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary-soft);
  color: var(--color-primary-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.user-meta strong {
  font-size: 0.88rem;
  color: var(--color-text);
}

.user-meta span {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.logout-btn {
  padding: 0.45rem 0.9rem;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.logout-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.content {
  padding: 2rem 1.75rem;
  max-width: 1080px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.3rem;
  margin-bottom: 1.25rem;
}
</style>
