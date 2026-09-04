// Rótulos das opções usadas nos formulários. Mantidos em um só lugar para que os
// mesmos campos apareçam iguais em todas as telas do sistema.

export const PERFIS = {
  ENGENHEIRO: 'Engenheiro',
  ADMIN: 'Administrador',
}

export const TIPOS_EMPREENDIMENTO = {
  CASA: 'Casa',
  PREDIO: 'Prédio',
  GALPAO: 'Galpão',
}

export const TIPOS_PRUMADA = {
  COZINHA: 'Cozinha',
  ARS: 'ARS - Área de serviço',
}

export const DESCONECTORES = {
  '50mm': '50mm',
  '75mm': '75mm',
}

// Tabela 1 da NBR 7229: cada tipo carrega sua contribuição de despejos e de lodo fresco,
// que ficam no backend (enum ContribuicaoDespejo). Aqui só os rótulos.
export const TIPOS_CONTRIBUICAO = {
  RESIDENCIA_PADRAO_ALTO: 'Residência — padrão alto',
  RESIDENCIA_PADRAO_MEDIO: 'Residência — padrão médio',
  RESIDENCIA_PADRAO_BAIXO: 'Residência — padrão baixo',
  HOTEL: 'Hotel (sem lavanderia e cozinha)',
  ALOJAMENTO_PROVISORIO: 'Alojamento provisório',
  FABRICA: 'Fábrica em geral',
  ESCRITORIO: 'Escritório',
  EDIFICIO_PUBLICO_COMERCIAL: 'Edifício público ou comercial',
  ESCOLA: 'Escola (externato)',
  RESTAURANTE: 'Restaurante e similares',
  BAR: 'Bar',
  CINEMA_TEATRO: 'Cinema, teatro e locais de curta permanência',
  SANITARIO_PUBLICO: 'Sanitário público',
}

// Coluna "Unidade" da Tabela 1: o que N conta em cada tipo de prédio.
export const UNIDADES_CONTRIBUICAO = {
  PESSOA: 'pessoas',
  REFEICAO: 'refeições',
  LUGAR: 'lugares',
  BACIA_SANITARIA: 'bacias sanitárias',
}

export const CONCESSIONARIAS = {
  DMAE: 'DMAE — Uberlândia/MG',
  SABESP: 'SABESP — São Paulo/SP',
  CESAMA: 'CESAMA — Juiz de Fora/MG',
  COPASA: 'COPASA — Minas Gerais',
  SANEAGO: 'SANEAGO — Goiás',
  SANEPAR: 'SANEPAR — Paraná',
  OUTRA: 'Outra',
}

// Vazões nominais padronizadas pela NBR 14005 / ISO 4064, em m³/h.
export const HIDROMETROS = {
  QN_0_75: '0,75 m³/h',
  QN_1_5: '1,5 m³/h',
  QN_2_5: '2,5 m³/h',
  QN_3_5: '3,5 m³/h',
  QN_5: '5 m³/h',
  QN_7: '7 m³/h',
  QN_10: '10 m³/h',
  QN_15: '15 m³/h',
  QN_20: '20 m³/h',
  QN_30: '30 m³/h',
}

export const FORMAS_TANQUE = {
  PRISMATICO_RETANGULAR: 'Prismático retangular',
  CILINDRICO: 'Cilíndrico',
}

export const FAIXAS_TEMPERATURA = {
  ATE_10: 'Até 10 °C',
  DE_10_A_20: 'Entre 10 °C e 20 °C',
  ACIMA_20: 'Acima de 20 °C',
}

export const CONDICOES_SANCA = {
  SEM_SANCA: 'Sem sanca',
  ATE_1_2: 'Até 1,2m',
  ENTRE_1_2_E_1_8: 'Entre 1,2m e 1,8m',
  ACIMA_1_8: 'Acima de 1,8m',
}

// Sentido do trecho no circuito de recirculação da piscina. Define o sinal do
// desnível no balanço de pressão e o limite de velocidade da NBR 10339.
export const SENTIDOS_TRECHO = {
  SUCCAO: 'Sucção (ralo → filtro)',
  RECALQUE: 'Recalque (filtro → bocal)',
}

export const STATUS_ORCAMENTO = {
  RASCUNHO: 'Rascunho',
  ENVIADO: 'Enviado',
  APROVADO: 'Aprovado',
  RECUSADO: 'Recusado',
}
