<template>
  <div class="card-item-box">
    <RouterLink class="card-item" :to="to" :title="titulo ?? nome">
      <div class="card-item-icone">
        <span class="card-item-iniciais">{{ iniciais(nome) }}</span>
      </div>

      <strong class="card-item-nome">{{ nome }}</strong>
      <span v-if="info" class="card-item-info">{{ info }}</span>
    </RouterLink>

    <MenuCard
      :nome="nome"
      :aviso-exclusao="avisoExclusao"
      :excluindo="excluindo"
      @editar="$emit('editar')"
      @excluir="$emit('excluir')"
    />
  </div>
</template>

<script setup>
import MenuCard from '@/components/MenuCard.vue'
import { iniciais } from '@/utils/texto'

defineProps({
  nome: { type: String, required: true },
  to: { type: Object, required: true },
  titulo: { type: String, default: null },
  info: { type: String, default: '' },
  avisoExclusao: { type: String, required: true },
  excluindo: { type: Boolean, default: false },
})

defineEmits(['editar', 'excluir'])
</script>
