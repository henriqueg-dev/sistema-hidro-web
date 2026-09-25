<template>
  <div>
    <section class="site-topo site-planta">
      <div class="site-container">
        <h1>Assistente de IA</h1>
        <p>
          Um colega de escritório que conhece as normas de instalações prediais e enxerga os
          cálculos salvos do seu empreendimento. Ele confere números, explica critérios e mostra a
          memória de cálculo.
        </p>
      </div>
    </section>

    <section class="site-secao site-demo">
      <div class="site-container">
        <SiteConversa :conversas="CONVERSAS" />
        <p class="site-demo-nota">
          Demonstração com conversas de exemplo. Escolha uma conversa na lista para vê-la de novo.
        </p>
      </div>
    </section>

    <section class="site-secao clara">
      <div class="site-container">
        <header class="site-secao-cabecalho" v-revelar>
          <h2>O que ele conhece</h2>
          <p>
            As normas brasileiras de instalações prediais e, sobretudo, os critérios exatos que o
            Hidros usa em cada cálculo. Assim a resposta bate com o que você vê na tela.
          </p>
        </header>

        <ul class="site-grade-info">
          <li v-for="norma in NORMAS" :key="norma.numero" v-revelar>
            <span class="site-norma">{{ norma.numero }}</span>
            <h3>{{ norma.nome }}</h3>
          </li>
        </ul>
      </div>
    </section>

    <section class="site-secao">
      <div class="site-container site-dupla">
        <div class="site-dupla-texto" v-revelar>
          <h2>De onde vêm os números</h2>
          <p>
            O assistente segue sempre a mesma ordem para escolher cada valor e escreve a origem ao
            lado da conta. Você sabe o que é dado do projeto e o que foi referência adotada.
          </p>
        </div>

        <ol class="site-prioridades" v-revelar>
          <li>
            <h3>Dado do empreendimento</h3>
            <p>Cadastro e cálculos salvos mandam, mesmo quando o valor parece atípico.</p>
          </li>
          <li>
            <h3>Valor informado na pergunta</h3>
            <p>Se divergir do cadastro, ele usa o seu valor e avisa da diferença.</p>
          </li>
          <li>
            <h3>Referência da norma para esse projeto</h3>
            <p>
              Escolhida pelo tipo e pelo porte do empreendimento, citando a norma e pedindo que você
              confirme.
            </p>
          </li>
          <li>
            <h3>Pergunta</h3>
            <p>Sem referência segura, ele pergunta em vez de calcular.</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="site-secao clara">
      <div class="site-container site-dupla invertida">
        <pre class="site-formula grande" v-revelar>{{ EXEMPLO }}</pre>
        <div class="site-dupla-texto" v-revelar>
          <h2>Como ele responde</h2>
          <ul class="site-lista-marcas">
            <li>Começa pela resposta; a justificativa normativa vem depois.</li>
            <li>Cita a norma e só cita o item quando tem certeza dele.</li>
            <li>Mostra a fórmula, a origem de cada valor e o resultado com a unidade.</li>
            <li>Responde no tamanho da pergunta: dúvida de uma linha, resposta curta.</li>
            <li>Aponta divergência entre cálculos salvos quando ela afeta a pergunta.</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="site-secao">
      <div class="site-container">
        <header class="site-secao-cabecalho" v-revelar>
          <h2>Onde ele para</h2>
          <p>O assistente apoia a decisão do engenheiro; não a substitui.</p>
        </header>

        <ul class="site-grade-info tres">
          <li v-revelar>
            <h3>Não inventa valor de norma</h3>
            <p>Sem certeza de um número tabelado, ele diz o que precisaria ser consultado.</p>
          </li>
          <li v-revelar>
            <h3>Não aprova o que não verificou</h3>
            <p>Um dimensionamento que ele não conseguiu conferir nunca sai como correto.</p>
          </li>
          <li v-revelar>
            <h3>Avisa quando sai do usual</h3>
            <p>Fora do escopo normativo comum, ele diz isso e recomenda verificar em projeto.</p>
          </li>
        </ul>
      </div>
    </section>

    <section class="site-secao clara">
      <div class="site-container">
        <header class="site-secao-cabecalho" v-revelar>
          <h2>Disponível por plano</h2>
          <p>As conversas ficam salvas e podem ser ligadas a um empreendimento ou não.</p>
        </header>

        <ul class="site-grade-info tres">
          <li v-for="plano in PLANOS" :key="plano.valor" v-revelar>
            <h3>{{ plano.nome }}</h3>
            <p>{{ plano.assistente }}</p>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup>
import SiteConversa from '@/site/components/SiteConversa.vue'
import vRevelar from '@/site/diretivas/revelar'
import { CONVERSAS } from '@/site/conteudo/conversas'
import { PLANOS } from '@/constants/opcoes'

const NORMAS = [
  { numero: 'NBR 5626', nome: 'Sistemas prediais de água fria e água quente' },
  { numero: 'NBR 8160', nome: 'Sistemas prediais de esgoto sanitário' },
  { numero: 'NBR 10844', nome: 'Instalações prediais de águas pluviais' },
  { numero: 'NBR 7229', nome: 'Tanques sépticos: projeto, construção e operação' },
  { numero: 'NBR 13969', nome: 'Unidades de tratamento complementar e disposição de efluentes' },
  { numero: 'NBR 10339', nome: 'Piscinas: projeto, execução e manutenção' },
]

const EXEMPLO = `Memória de cálculo:
N  = To x Na = 4 x 48 = 192 hab
Cd = N x q = 192 x 150 = 28.800 L/dia

Origem dos valores:
- To = 4 hab/apto e Na = 48 — do cálculo
  de caixa de gordura salvo aqui
- q = 150 L/hab/dia — referência de norma
  para residencial multifamiliar; não há
  cálculo salvo com esse dado

Confirme o per capita ou troque pelo
adotado no seu projeto.`
</script>
