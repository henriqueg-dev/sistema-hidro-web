import api from '@/services/api'
import { criarServicoCalculo } from '@/services/calculoService'

export const { criar, atualizar, excluir, listarPorEmpreendimento, baixarMemorialPdf } =
  criarServicoCalculo('piscinas')

export function referencias() {
  return api.get('/api/piscinas/referencias').then((response) => response.data)
}
