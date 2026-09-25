import { defineStore } from 'pinia'
import { ref } from 'vue'

/** Aviso global exibido no topo do AppLayout (ex.: 403 vindo de qualquer tela). */
export const useAvisoStore = defineStore('aviso', () => {
  const mensagem = ref('')

  function mostrar(texto) {
    mensagem.value = texto
  }

  function limpar() {
    mensagem.value = ''
  }

  return { mensagem, mostrar, limpar }
})
