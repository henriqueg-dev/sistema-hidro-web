<template>
  <!-- Quem já tem sessão vai direto ao painel, sem passar pelo login. -->
  <RouterLink :to="{ name: logado ? 'home' : 'login' }" class="site-botao">
    {{ logado ? 'Abrir o sistema' : 'Entrar' }}
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const logado = computed(() => authStore.isAuthenticated)
</script>
