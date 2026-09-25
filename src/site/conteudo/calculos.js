// Cálculos do sistema agrupados por rede. As travas espelham o prompt do assistente
// (api: prompts/assistente-sistema.md); ao mudar um cálculo, atualizar aqui também.
export const SISTEMAS = [
  {
    id: 'agua-fria',
    nome: 'Água fria',
    rede: 'agua',
    resumo: 'Da rua até a caixa d’água: consumo, reservação, alimentador, medidor e bomba.',
    calculos: [
      {
        id: 'vazao-predial',
        nome: 'Vazão predial e reservação',
        norma: 'NBR 5626',
        resumo:
          'Consumo diário, volume da caixa d’água e as vazões média, máxima diária e máxima horária do prédio.',
        entradas: [
          'Taxa de ocupação (hab/apto)',
          'Número de apartamentos',
          'Consumo per capita (L/hab·dia)',
          'Dias de reservação',
        ],
        verificacoes: [
          'Reserva repartida em 60% no reservatório inferior e 40% no superior.',
          'Vazão máxima horária também em m³/h e em estimativa mensal.',
        ],
      },
      {
        id: 'ramal-predial',
        nome: 'Ramal predial e hidrômetro',
        norma: 'NBR 5626 e NBR 14005',
        resumo:
          'Alimentador entre o hidrômetro e o reservatório inferior, com o DN comercial e o medidor sugerido.',
        entradas: [
          'Taxa de ocupação e número de unidades',
          'Consumo per capita (L/hab·dia)',
          'Tempo de reposição do reservatório (opcional)',
          'Velocidade máxima admitida (opcional)',
        ],
        verificacoes: [
          'Sem tempo informado, adota o máximo da norma: 3 h para casa e 6 h para prédio ou galpão.',
          'Adota o menor DN de PVC soldável em que a velocidade real não passa do limite.',
          'Hidrômetro: menor Qn da faixa padronizada (0,75 a 30 m³/h) que cobre a vazão.',
          'Alerta acima de 1,0 m/s, limite que as concessionárias costumam pedir.',
        ],
      },
      {
        id: 'recalque',
        nome: 'Recalque',
        norma: 'NBR 5626',
        resumo:
          'Instalação elevatória do reservatório inferior ao superior: diâmetros, altura manométrica e potência da bomba.',
        entradas: [
          'Consumo diário (ocupação, unidades e per capita)',
          'Horas de funcionamento da bomba por dia',
          'Desnível e comprimento da sucção e do recalque',
          'Conexões de cada trecho e rendimento do conjunto',
        ],
        verificacoes: [
          'Sucção com o diâmetro comercial seguinte ao do recalque.',
          'Velocidade máxima de 3,0 m/s.',
          'Alerta quando a bomba passa de 6,67 h/dia de funcionamento.',
          'Sugere o menor motor usual que cobre a potência com a folga de projeto.',
        ],
      },
    ],
  },
  {
    id: 'esgoto',
    nome: 'Esgoto sanitário',
    rede: 'esgoto',
    resumo: 'O que desce pelos pavimentos: prumadas e a caixa que retém gordura e sabão.',
    calculos: [
      {
        id: 'prumada',
        nome: 'Prumada de esgoto',
        norma: 'NBR 8160',
        resumo:
          'Quantidade de prumadas, diâmetros e necessidade de ventilação para cozinha ou área de serviço.',
        entradas: [
          'Tipo: cozinha ou área de serviço',
          'Número de pavimentos do empreendimento',
          'Desconector de 50 mm ou 75 mm',
          'Condição da sanca',
        ],
        verificacoes: [
          'Faixas de pavimentos: até 5 (só área de serviço), 9, 16, 18 e acima de 18.',
          'O térreo sempre recebe prumada independente.',
        ],
      },
      {
        id: 'caixa-gordura',
        nome: 'Caixa de gordura e sabão',
        norma: 'NBR 8160',
        resumo: 'Volume da caixa que recebe o efluente das cozinhas e das áreas de serviço.',
        entradas: ['Taxa de ocupação (hab/apto)', 'Número de apartamentos'],
        verificacoes: ['Até duas caixas por empreendimento.'],
      },
    ],
  },
  {
    id: 'efluentes',
    nome: 'Tratamento de efluentes',
    rede: 'esgoto',
    resumo: 'Onde não há rede pública: tanque séptico e infiltração no solo.',
    calculos: [
      {
        id: 'tanque-septico',
        nome: 'Tanque séptico',
        norma: 'NBR 7229',
        resumo:
          'Volume útil e dimensões internas, prismático retangular ou cilíndrico, a partir das unidades de contribuição.',
        entradas: [
          'Tipo de ocupação, entre os 13 da Tabela 1',
          'Unidades de contribuição',
          'Intervalo entre limpezas (1 a 5 anos)',
          'Temperatura do mês mais frio',
        ],
        verificacoes: [
          'Período de detenção T pela Tabela 2 e acumulação de lodo K pela Tabela 3.',
          'Volume útil mínimo de 1.250 L.',
          'Acima de 12.000 L/dia de contribuição, indica buscar outra solução.',
        ],
      },
      {
        id: 'sumidouro',
        nome: 'Sumidouro',
        norma: 'NBR 13969 e NBR 17076',
        resumo:
          'Área de infiltração e altura útil de um ou mais sumidouros, a partir do ensaio de percolação do solo.',
        entradas: [
          'Contribuição diária (L/dia)',
          'Taxa de percolação do solo (min/m)',
          'Diâmetro interno e número de sumidouros',
        ],
        verificacoes: [
          'Recusa solo com percolação acima de 2.400 min/m.',
          'Alerta com diâmetro abaixo de 1,00 m, mínimo da NBR 17076:2024.',
          'Avisa quando a contribuição diverge da do tanque séptico.',
        ],
      },
    ],
  },
  {
    id: 'piscina',
    nome: 'Piscina',
    rede: 'agua',
    resumo: 'Recirculação e filtragem, com a perda de carga de cada trecho.',
    calculos: [
      {
        id: 'piscina',
        nome: 'Conjunto de recirculação',
        norma: 'NBR 10339',
        resumo:
          'Vazão de projeto, diâmetros, dispositivos e o balanço de pressão trecho a trecho até o bocal mais desfavorável.',
        entradas: [
          'Largura, comprimento e profundidade',
          'Tempo de filtração pela tipologia (Tabela 1)',
          'Vazão e altura manométrica da bomba de catálogo',
          'Trechos com DN, desnível, comprimento e conexões',
        ],
        verificacoes: [
          'Recusa bomba com vazão menor que a de projeto.',
          'Bocais de retorno, skimmers e ralos de fundo calculados pela área.',
          'Velocidade máxima de 1,8 m/s na sucção e 3,0 m/s no recalque.',
          'Pressão residual no bocal mais desfavorável.',
        ],
      },
    ],
  },
]
