<template>
  <div>
    <section class="site-hero site-planta">
      <div class="site-container site-hero-conteudo">
        <div class="site-hero-texto">
          <h1>Os cálculos hidráulicos do prédio inteiro, cada um com a sua norma.</h1>
          <p>
            Do ramal predial ao sumidouro, o Hidros dimensiona a instalação hidrossanitária pelas
            NBRs, guarda tudo no empreendimento e entrega o memorial de cálculo em PDF.
          </p>
          <div class="site-acoes">
            <RouterLink :to="{ name: 'site-calculos' }" class="site-botao claro">
              Conhecer os cálculos
            </RouterLink>
            <RouterLink :to="{ name: 'site-assistente' }" class="site-botao contorno">
              Ver o assistente de IA
            </RouterLink>
          </div>
        </div>

        <SiteDiagrama />
      </div>
    </section>

    <div class="site-container">
      <dl class="site-numeros">
        <div v-for="numero in NUMEROS" :key="numero.rotulo" v-revelar>
          <dt>{{ numero.rotulo }}</dt>
          <dd><SiteContador :valor="numero.valor" /></dd>
        </div>
      </dl>
    </div>

    <section class="site-secao">
      <div class="site-container">
        <header class="site-secao-cabecalho" v-revelar>
          <h2>Organizado do jeito que o projeto é organizado</h2>
          <p>
            Cada cliente tem seus empreendimentos, e cada empreendimento guarda os próprios
            cálculos. Os dados de projeto cadastrados uma vez já chegam preenchidos em todos os
            formulários.
          </p>
        </header>

        <ol class="site-hierarquia">
          <li v-revelar>
            <h3>Cliente</h3>
            <p>Quem encomendou o projeto, com todos os empreendimentos dele num lugar só.</p>
            <div class="site-ficha">
              <strong>Construtora Aroeira</strong>
              <span>3 empreendimentos</span>
            </div>
          </li>
          <li v-revelar>
            <h3>Empreendimento</h3>
            <p>Tipo, pavimentos, concessionária e os dados de projeto que os cálculos usam.</p>
            <div class="site-ficha">
              <strong>Residencial Ipê</strong>
              <span>Prédio, 12 pavimentos</span>
              <span>DMAE — Uberlândia/MG</span>
              <span>48 apartamentos, 4 hab/apto</span>
            </div>
          </li>
          <li v-revelar>
            <h3>Cálculos</h3>
            <p>Salvos no empreendimento, revisados quando o projeto muda, cada um com seu PDF.</p>
            <div class="site-ficha">
              <strong>Vazão predial</strong>
              <span>57,6 m³ de reservação</span>
              <strong>Recalque</strong>
              <span>Motor sugerido pela potência</span>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <section class="site-secao clara">
      <div class="site-container">
        <header class="site-secao-cabecalho" v-revelar>
          <h2>Alguns dos cálculos de cada sistema da instalação</h2>
          <p>
            Cada cálculo mostra a fórmula, a origem de cada valor e os limites da norma que ele
            confere antes de dar o resultado. Se precisar de outro, podemos adicionar.
          </p>
        </header>

        <div class="site-sistemas">
          <RouterLink
            v-for="sistema in SISTEMAS"
            :key="sistema.id"
            v-revelar
            :to="{ name: 'site-calculos', hash: `#${sistema.calculos[0].id}` }"
            class="site-sistema-cartao"
            :data-rede="sistema.rede"
          >
            <h3>{{ sistema.nome }}</h3>
            <p>{{ sistema.resumo }}</p>
            <ul>
              <li v-for="calculo in sistema.calculos" :key="calculo.id">
                {{ calculo.nome }}
                <span class="site-norma">{{ calculo.norma }}</span>
              </li>
            </ul>
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="site-secao">
      <div class="site-container site-dupla">
        <div class="site-dupla-texto" v-revelar>
          <h2>Um assistente que lê o seu projeto</h2>
          <p>
            Pergunte em português, como faria a um colega de escritório. Dentro de um
            empreendimento, o assistente enxerga o cadastro e os cálculos salvos, confere os números
            e diz de onde veio cada valor.
          </p>
          <ul class="site-lista-marcas">
            <li>Responde primeiro e justifica depois, com a norma citada.</li>
            <li>Mostra a memória de cálculo, uma conta por linha.</li>
            <li>Pergunta quando falta um dado, em vez de inventar.</li>
          </ul>
          <RouterLink :to="{ name: 'site-assistente' }" class="site-botao primario">
            Como o assistente funciona
          </RouterLink>
        </div>
        <SiteConversa :conversas="CONVERSAS" />
      </div>
    </section>

    <section class="site-secao clara">
      <div class="site-container site-dupla invertida">
        <SiteMemorial />
        <div class="site-dupla-texto" v-revelar>
          <h2>Todo cálculo vira um memorial em PDF</h2>
          <p>
            Dados de entrada, resultado e a identificação do cliente e do empreendimento, num
            documento pronto para anexar ao projeto.
          </p>
          <ul class="site-lista-marcas">
            <li>Um memorial para cada cálculo.</li>
            <li>Gerado na hora, sempre com os valores salvos mais recentes.</li>
            <li>Sem limite de memoriais em nenhum plano.</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="site-secao">
      <div class="site-container">
        <header class="site-secao-cabecalho" v-revelar>
          <h2>Do cadastro ao memorial, sem planilha no meio</h2>
          <p>
            O mesmo caminho para qualquer projeto, da casa térrea ao prédio de vários pavimentos.
          </p>
        </header>

        <ol class="site-passos" v-revelar>
          <li>
            <h3>Cadastre o cliente</h3>
            <p>Quem encomendou o projeto fica registrado com todos os empreendimentos dele.</p>
          </li>
          <li>
            <h3>Crie o empreendimento</h3>
            <p>Casa, prédio ou galpão, com os pavimentos e os dados de projeto.</p>
          </li>
          <li>
            <h3>Rode os cálculos</h3>
            <p>Preencha o que falta e veja o resultado na hora, com os alertas da norma.</p>
          </li>
          <li>
            <h3>Baixe o memorial e orce</h3>
            <p>O memorial em PDF vai para o projeto, e o orçamento em PDF vai para o cliente.</p>
          </li>
        </ol>
      </div>
    </section>
  </div>
</template>

<script setup>
import SiteDiagrama from '@/site/components/SiteDiagrama.vue'
import SiteContador from '@/site/components/SiteContador.vue'
import SiteConversa from '@/site/components/SiteConversa.vue'
import SiteMemorial from '@/site/components/SiteMemorial.vue'
import vRevelar from '@/site/diretivas/revelar'
import { SISTEMAS } from '@/site/conteudo/calculos'
import { CONVERSAS } from '@/site/conteudo/conversas'

const NUMEROS = [
  { valor: 8, rotulo: 'cálculos prediais' },
  { valor: 7, rotulo: 'normas ABNT aplicadas' },
  { valor: 13, rotulo: 'tipos de ocupação da NBR 7229' },
  { valor: 4, rotulo: 'sistemas da instalação' },
]
</script>
