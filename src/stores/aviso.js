import { defineStore } from 'pinia'
import { ref } from 'vue'

const DURACAO_MS = 8000

/** Popups de erro globais, exibidos no App.vue por cima de qualquer tela. */
export const useAvisoStore = defineStore('aviso', () => {
  const avisos = ref([])
  let proximoId = 0

  function mostrar(texto) {
    // O mesmo erro pode chegar por mais de um caminho (interceptor + handler global).
    if (!texto || avisos.value.some((aviso) => aviso.texto === texto)) return
    const id = ++proximoId
    avisos.value.push({ id, texto })
    setTimeout(() => fechar(id), DURACAO_MS)
  }

  function fechar(id) {
    avisos.value = avisos.value.filter((aviso) => aviso.id !== id)
  }

  return { avisos, mostrar, fechar }
})
