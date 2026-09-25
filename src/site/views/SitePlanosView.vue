<template>
  <div>
    <section class="site-topo site-planta">
      <div class="site-container">
        <h1>Planos</h1>
        <p>
          Os planos mudam pelo tamanho da equipe e pelo uso do assistente de IA. Cálculos,
          orçamentos e memoriais em PDF são ilimitados em todos.
        </p>
      </div>
    </section>

    <section class="site-secao">
      <div class="site-container">
        <ul class="site-planos">
          <li v-for="plano in PLANOS" :key="plano.valor" v-revelar class="site-plano">
            <h2>{{ plano.nome }}</h2>
            <p class="site-plano-preco">
              {{ formatarReais(plano.precoCentavos / 100) }}<span>/mês</span>
            </p>
            <ul>
              <li>{{ plano.usuarios }}</li>
              <li>{{ plano.assistente }}</li>
              <li>Todos os cálculos, sem limite</li>
              <li>Memoriais e orçamentos em PDF</li>
            </ul>
          </li>
        </ul>

        <div class="site-tabela-rolagem" v-revelar>
          <table class="site-comparativo">
            <caption>
              Comparação entre os planos
            </caption>
            <thead>
              <tr>
                <th>Recurso</th>
                <th v-for="plano in PLANOS" :key="plano.valor">{{ plano.nome }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Usuários</td>
                <td v-for="plano in PLANOS" :key="plano.valor">{{ plano.usuarios }}</td>
              </tr>
              <tr>
                <td>Assistente de IA</td>
                <td v-for="plano in PLANOS" :key="plano.valor">{{ plano.assistente }}</td>
              </tr>
              <tr v-for="recurso in RECURSOS_COMUNS" :key="recurso">
                <td>{{ recurso }}</td>
                <td v-for="plano in PLANOS" :key="plano.valor">Incluído</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="site-secao clara">
      <div class="site-container site-perguntas">
        <header class="site-secao-cabecalho" v-revelar>
          <h2>Perguntas frequentes</h2>
          <p>Sobre assinatura, pagamento e acesso da equipe.</p>
        </header>

        <div class="site-perguntas-lista">
          <details v-for="item in PERGUNTAS" :key="item.pergunta" v-revelar>
            <summary>{{ item.pergunta }}</summary>
            <p>{{ item.resposta }}</p>
          </details>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import vRevelar from '@/site/diretivas/revelar'
import { PLANOS } from '@/constants/opcoes'
import { formatarReais } from '@/utils/formato'

const RECURSOS_COMUNS = [
  'Todos os cálculos',
  'Memoriais de cálculo em PDF',
  'Orçamentos em PDF',
  'Tabelas normativas',
  'Auditoria de alterações',
]

const PERGUNTAS = [
  {
    pergunta: 'Como faço a assinatura?',
    resposta:
      'O administrador do escritório escolhe o plano na tela de Assinatura, dentro do sistema. O Hidros gera uma cobrança PIX com QR code e código copia e cola.',
  },
  {
    pergunta: 'Quando a assinatura é ativada?',
    resposta:
      'Assim que o pagamento é confirmado, automaticamente. Na tela de Assinatura, o botão "Já paguei" atualiza a situação na hora.',
  },
  {
    pergunta: 'O que acontece quando a assinatura vence?',
    resposta:
      'A situação passa a "Vencida" e os usuários veem um aviso para que um administrador regularize o pagamento.',
  },
  {
    pergunta: 'Existe limite de cálculos ou de memoriais?',
    resposta: 'Não. Cálculos, orçamentos e memoriais em PDF são ilimitados em todos os planos.',
  },
  {
    pergunta: 'Como a equipe entra no sistema?',
    resposta:
      'O administrador cadastra cada pessoa com nome, e-mail e perfil. Ela recebe o convite e define a própria senha.',
  },
  {
    pergunta: 'Os dados do meu escritório ficam separados?',
    resposta:
      'Sim. Cada escritório tem o próprio banco de dados, e as alterações ficam registradas na auditoria.',
  },
]
</script>
