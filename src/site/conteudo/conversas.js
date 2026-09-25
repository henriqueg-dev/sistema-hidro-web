// Conversas de demonstração do assistente. Seguem as regras do prompt real: texto puro,
// resposta primeiro, uma conta por linha e a origem de cada valor.
export const CONVERSAS = [
  {
    titulo: 'Conferir a reservação',
    contexto: 'Residencial Ipê',
    pergunta: 'Confere a reservação que salvei? Achei o volume alto.',
    resposta: `O volume está coerente com os dados salvos: 57,6 m3.

Memória de cálculo:
N  = To x Na = 4 x 48 = 192 hab
Cd = N x q = 192 x 200 = 38.400 L/dia
V  = Cd x d / 1000 = 38.400 x 1,5 / 1000 = 57,6 m3

Origem dos valores:
- To, Na, q e d — do cálculo de vazão predial salvo neste empreendimento

O que puxa o volume para cima é o consumo de 200 L/hab/dia. Com 150, a reservação cai para 43,2 m3.`,
  },
  {
    titulo: 'Hidrômetro da casa',
    contexto: 'Casa Jardim Karaíba',
    pergunta: 'Qual hidrômetro eu uso nessa casa?',
    resposta: `Pelo cálculo, o de Qn 0,75 m3/h, o menor da faixa padronizada.

Memória de cálculo:
N  = To x Nu = 5 x 1 = 5 hab
Cd = N x q / 1000 = 5 x 200 / 1000 = 1,0 m3/dia
Q  = Cd / T = 1,0 / 3 = 0,33 m3/h

Origem dos valores:
- To, Nu e q — do cadastro do empreendimento
- T = 3 h — máximo da NBR 5626 para residência unifamiliar, adotado porque não há tempo informado

Antes de fechar, confira a tabela do DMAE: a concessionária costuma escolher o medidor pela faixa de consumo mensal e pode pedir um maior.`,
  },
  {
    titulo: 'Volume mínimo do tanque',
    contexto: null,
    pergunta: 'Qual o volume mínimo de um tanque séptico?',
    resposta: `1.250 L de volume útil, pela NBR 7229. Se a fórmula der menos, o sistema adota o mínimo.

V = 1000 + N x (C x T + K x Lf)

Exemplo com valores de ilustração, casa de padrão médio com 5 pessoas, limpeza anual e mês mais frio entre 10 e 20 °C:
Cd = 5 x 130 = 650 L/dia, então T = 1,00 d
K  = 65 dias
V  = 1000 + 5 x (130 x 1,00 + 65 x 1,0) = 1.975 L

Para um cálculo real, abra a conversa dentro do empreendimento.`,
  },
]
