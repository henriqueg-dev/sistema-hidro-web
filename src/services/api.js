import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useAvisoStore } from '@/stores/aviso'
import router from '@/router'

const CABECALHO_RENOVACAO = 'x-token-renovado'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8081',
})

api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    // O backend renova o token enquanto há uso; parado, ele expira por inatividade.
    const renovado = response.headers?.[CABECALHO_RENOVACAO]
    if (renovado) {
      useAuthStore().renovarToken(renovado)
    }
    return response
  },
  async (error) => {
    if (axios.isCancel(error)) return Promise.reject(error)

    // Em /api/auth, 401/403 é senha ou código errado: a própria tela mostra a mensagem.
    const ehAutenticacao = error.config?.url?.startsWith('/api/auth/')
    const status = error.response?.status

    if (status === 401 && !ehAutenticacao) {
      const authStore = useAuthStore()
      authStore.logout()
      router.push({ name: 'login', query: { expirado: '1' } })
    } else if (!(ehAutenticacao && (status === 401 || status === 403))) {
      useAvisoStore().mostrar(await mensagemDoErro(error))
    }
    if (status === 402 && router.currentRoute.value.name !== 'assinatura') {
      router.push({ name: 'assinatura' })
    }
    return Promise.reject(error)
  },
)

const MENSAGEM_POR_STATUS = {
  400: 'Dados inválidos na requisição.',
  402: 'Sua assinatura está inativa. Regularize para continuar usando o sistema.',
  403: 'Seu perfil não tem permissão para esta ação.',
  404: 'Registro não encontrado.',
  405: 'Operação não suportada pelo servidor.',
  408: 'O servidor demorou demais para responder. Tente novamente.',
  409: 'A operação conflita com os dados atuais.',
  413: 'O arquivo ou os dados enviados são grandes demais.',
  415: 'Formato de dados não suportado.',
  422: 'Os dados informados não puderam ser processados.',
  429: 'Muitas requisições em pouco tempo. Aguarde e tente novamente.',
  500: 'Ocorreu um erro inesperado no servidor.',
  502: 'O servidor está indisponível no momento. Tente novamente em instantes.',
  503: 'O servidor está indisponível no momento. Tente novamente em instantes.',
  504: 'O servidor demorou demais para responder. Tente novamente.',
}

async function mensagemDoErro(error) {
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return 'A requisição demorou demais. Verifique sua conexão e tente novamente.'
    }
    return navigator.onLine
      ? 'Não foi possível conectar ao servidor. Tente novamente em instantes.'
      : 'Sem conexão com a internet.'
  }

  const { status } = error.response
  let dados = error.response.data
  // Downloads (responseType: 'blob') trazem o JSON de erro dentro de um Blob.
  if (dados instanceof Blob) {
    try {
      dados = JSON.parse(await dados.text())
    } catch {
      dados = null
    }
  }

  const campos = Object.values(dados?.camposInvalidos ?? {})
  const mensagem =
    dados?.mensagem ??
    MENSAGEM_POR_STATUS[status] ??
    (status >= 500 ? MENSAGEM_POR_STATUS[500] : `Erro ${status} ao processar a requisição.`)
  return campos.length ? `${mensagem}: ${campos.join('; ')}` : mensagem
}

export default api
