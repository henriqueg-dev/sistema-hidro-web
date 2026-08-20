<template>
  <details ref="menu" class="menu-card" @toggle="aoAlternar">
    <summary :title="`Ações de ${nome}`" :aria-label="`Ações de ${nome}`">&#8942;</summary>

    <div class="menu-card-opcoes">
      <template v-if="confirmando">
        <span class="menu-card-aviso">{{ avisoExclusao }}</span>
        <button type="button" class="perigo" :disabled="excluindo" @click="$emit('excluir')">
          {{ excluindo ? 'Excluindo...' : 'Sim, excluir' }}
        </button>
        <button type="button" :disabled="excluindo" @click="confirmando = false">Cancelar</button>
      </template>

      <template v-else>
        <button type="button" @click="editar">Editar</button>
        <button type="button" class="perigo" @click="confirmando = true">Excluir</button>
      </template>
    </div>
  </details>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  nome: { type: String, required: true },
  avisoExclusao: { type: String, default: 'Confirma a exclusão?' },
  excluindo: { type: Boolean, default: false },
})

const emit = defineEmits(['editar', 'excluir'])

const menu = ref(null)
const confirmando = ref(false)

function aoAlternar() {
  if (!menu.value?.open) confirmando.value = false
}

function editar() {
  if (menu.value) menu.value.open = false
  emit('editar')
}
</script>
