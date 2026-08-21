import { reactive } from 'vue'

/**
 * Lista carregada do servidor com um termo de busca. O contador de requisição
 * evita que uma resposta atrasada sobrescreva o resultado de uma busca mais nova.
 */
export function useListaBuscavel(buscar, mensagemErro) {
  let requisicaoAtual = 0

  const estado = reactive({
    itens: [],
    carregando: false,
    busca: '',
    erro: '',

    async carregar() {
      const requisicao = ++requisicaoAtual
      estado.carregando = true
      estado.erro = ''

      try {
        const dados = await buscar(estado.busca)
        if (requisicao === requisicaoAtual) estado.itens = dados
      } catch {
        if (requisicao === requisicaoAtual) estado.erro = mensagemErro
      } finally {
        if (requisicao === requisicaoAtual) estado.carregando = false
      }
    },

    limparBusca() {
      if (!estado.busca) return
      estado.busca = ''
      return estado.carregar()
    },
  })

  return estado
}
