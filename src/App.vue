<template>
  <router-view />
  <div class="popups-erro" aria-live="assertive">
    <div v-for="item in aviso.avisos" :key="item.id" class="popup-erro" role="alert">
      <span>{{ item.texto }}</span>
      <button
        type="button"
        class="btn-link"
        aria-label="Fechar aviso"
        @click="aviso.fechar(item.id)"
      >
        &times;
      </button>
    </div>
  </div>
</template>

<script setup>
import { useAvisoStore } from '@/stores/aviso'

const aviso = useAvisoStore()
</script>
