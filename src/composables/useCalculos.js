import { reactive } from 'vue'

/**
 * Estado e CRUD de um cálculo que fica registrado no empreendimento.
 * `service` precisa expor listarPorEmpreendimento, criar, atualizar e excluir;
 * `formVazio` define os campos do formulário (e é o que vai no corpo da requisição).
 */
export function useCalculos(service, empreendimentoId, formVazio, opcoes = {}) {
  const estado = reactive({
    itens: [],
    carregando: false,
    form: { ...formVazio },
    formAberto: false,
    salvando: false,
    paraRemover: null,
    removendo: false,
    erro: '',

    get podeAdicionar() {
      return !opcoes.max || estado.itens.length < opcoes.max
    },

    get tituloForm() {
      if (!estado.form.id) return 'Novo cálculo'
      const posicao = estado.itens.findIndex((item) => item.id === estado.form.id)
      return `Alterando cálculo ${posicao + 1}`
    },

    async carregar() {
      estado.carregando = true
      try {
        estado.itens = await service.listarPorEmpreendimento(empreendimentoId)
      } catch {
        estado.erro = 'Não foi possível carregar os cálculos já registrados.'
      } finally {
        estado.carregando = false
      }
    },

    novo() {
      estado.form = { ...formVazio }
      estado.formAberto = true
      estado.paraRemover = null
      estado.erro = ''
    },

    editar(item) {
      estado.form = Object.fromEntries(
        Object.keys(formVazio).map((campo) => [campo, item[campo]]),
      )
      estado.formAberto = true
      estado.paraRemover = null
      estado.erro = ''
    },

    confirmarRemocao(item) {
      estado.paraRemover = item.id
    },

    cancelarRemocao() {
      estado.paraRemover = null
    },

    cancelar() {
      estado.formAberto = false
      estado.form = { ...formVazio }
      estado.erro = ''
    },

    async salvar() {
      estado.erro = ''
      estado.salvando = true

      const { id, ...campos } = estado.form
      const dados = { ...campos, empreendimentoId }

      try {
        if (id) {
          await service.atualizar(id, dados)
        } else {
          await service.criar(dados)
        }
        await estado.carregar()
        estado.cancelar()
      } catch (error) {
        estado.erro = error.response?.data?.mensagem ?? 'Não foi possível salvar o cálculo.'
      } finally {
        estado.salvando = false
      }
    },

    async remover(item) {
      estado.erro = ''
      estado.removendo = true

      try {
        await service.excluir(item.id)
        // O formulário pode estar aberto justamente sobre o cálculo removido.
        if (estado.form.id === item.id) estado.cancelar()
        await estado.carregar()
        estado.paraRemover = null
      } catch (error) {
        estado.erro = error.response?.data?.mensagem ?? 'Não foi possível remover o cálculo.'
      } finally {
        estado.removendo = false
      }
    },

    // Nem todo cálculo tem memorial em PDF; o botão só aparece quando o service o expõe.
    get temMemorial() {
      return !!service.baixarMemorialPdf
    },

    async baixarMemorial(item) {
      estado.erro = ''
      try {
        const blob = await service.baixarMemorialPdf(item.id)
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `memorial-${opcoes.nomeArquivo ?? 'calculo'}-${item.id}.pdf`
        link.click()
        URL.revokeObjectURL(url)
      } catch {
        estado.erro = 'Não foi possível gerar o memorial em PDF.'
      }
    },
  })

  return estado
}
