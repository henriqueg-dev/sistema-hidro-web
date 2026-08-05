<script setup>
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/AppLayout.vue'

const authStore = useAuthStore()
</script>

<template>
  <AppLayout>
    <div class="welcome-card">
      <h1>Bem-vindo(a), {{ authStore.nome }}</h1>
      <p>Você está autenticado como <strong>{{ authStore.perfil }}</strong>.</p>
      <p class="hint">Use o menu acima para gerenciar empresas, empreendimentos e prumadas.</p>
    </div>
  </AppLayout>
</template>

<style scoped>
.welcome-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1.75rem;
  box-shadow: var(--shadow-sm);
}

.welcome-card h1 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.welcome-card p {
  color: var(--color-text-muted);
}

.hint {
  margin-top: 0.5rem;
  font-size: 0.9rem;
}
</style>
