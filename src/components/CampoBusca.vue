<template>
  <form class="form-busca" @submit.prevent="$emit('buscar')">
    <input
      v-model="termo"
      type="search"
      class="campo-busca"
      :placeholder="placeholder"
      :aria-label="placeholder"
    />
    <button type="submit" :disabled="ocupado">Buscar</button>
  </form>
</template>

<script setup>
const termo = defineModel({ type: String, required: true })

defineProps({
  placeholder: { type: String, required: true },
  ocupado: { type: Boolean, default: false },
})

defineEmits(['buscar'])
</script>
