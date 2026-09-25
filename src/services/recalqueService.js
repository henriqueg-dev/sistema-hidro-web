import { criarServicoCalculo } from '@/services/calculoService'

export const { criar, atualizar, excluir, listarPorEmpreendimento, baixarMemorialPdf } =
  criarServicoCalculo('recalques')
