<template>
  <AppLayout>
    <div class="card">
      <h1>Bem-vindo(a), {{ authStore.nome }}</h1>
      <p class="texto-muted">
        Você está autenticado como <strong>{{ authStore.perfil }}</strong
        >.
      </p>
      <p class="texto-secundario">
        Use o menu ao lado para gerenciar empresas e prumadas. Os empreendimentos ficam dentro da
        página de cada empresa.
      </p>
    </div>
  </AppLayout>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/AppLayout.vue'

const authStore = useAuthStore()
</script>
