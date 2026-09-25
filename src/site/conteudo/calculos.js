// Cálculos do sistema agrupados por rede. Fórmulas e travas espelham o prompt do assistente
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
        memoria: `N      = To × Na            população atendida (hab)
Cd     = N × q              consumo diário (L/dia)
V      = Cd × d / 1000      reservação (m³)
Qméd   = Cd / 86400         vazão média (L/s)
Qmáx,d = Qméd × K1          K1 = 1,2
Qmáx,h = Qmáx,d × K2        K2 = 1,5`,
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
        memoria: `N  = To × Nu              população (hab)
Cd = N × q / 1000         consumo diário (m³/dia)
Q  = Cd / T               vazão de projeto (m³/h)
D  = √(4Q / π·v)          diâmetro teórico`,
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
        memoria: `Q    = Cd / (horas × 3600)             vazão de recalque
D    = 1,3 × (horas/24)^¼ × √Q         Forchheimer
J    = 8,69×10⁶ × Q^1,75 × d^−4,75     Fair-Whipple-Hsiao
hf   = J × (L real + L equivalente)
Hman = desníveis + hf sucção + hf recalque + V²/2g
P    = Q × Hman / (75 × η)             potência (cv)`,
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
        memoria: `Consulta às configurações normativas cadastradas:
tipo × faixa de pavimentos × desconector × sanca
→ recomendação de projeto`,
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
        memoria: `N  = To × Na         população atendida (hab)
Vc = 2 × N + 20      volume da caixa (L)`,
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
        memoria: `N  = To × Nu                        unidades de contribuição
Cd = N × C                         contribuição diária (L/dia)
V  = 1000 + N × (C × T + K × Lf)   volume útil (L)`,
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
        memoria: `Tx = Tabela A.1 (interpolação linear)
A  = Cd / Tx                     área de infiltração total (m²)
A1 = A / n                       área por sumidouro
h  = (A1 − πD²/4) / (πD)         altura útil`,
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
        memoria: `V  = L × C × h         volume (m³)
Qp = V / Tf           vazão de projeto (m³/h)
J  = 8,69×10⁶ × Q^1,75 / Øint^4,75 × 0,11
Hf = J × (Leq + Lreal)
P jusante = P montante ± desnível − Hf`,
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
