<template>
  <div>
    <section class="site-topo site-planta">
      <div class="site-container">
        <h1>Recursos</h1>
        <p>
          Além dos cálculos, o que o dia a dia de um escritório de projetos hidráulicos pede:
          cadastro, memoriais, orçamentos, consulta às tabelas e controle da equipe.
        </p>
      </div>
    </section>

    <section class="site-secao">
      <div class="site-container site-dupla">
        <div class="site-dupla-texto" v-revelar>
          <h2>Clientes e empreendimentos</h2>
          <p>
            O empreendimento guarda tipo, pavimentos, endereço, concessionária e, se você quiser, os
            dados de projeto: unidades, taxa de ocupação e consumo per capita.
          </p>
          <ul class="site-lista-marcas">
            <li>Os dados de projeto chegam preenchidos em todos os formulários de cálculo.</li>
            <li>Cada cálculo salvo grava os próprios valores, que podem divergir do cadastro.</li>
            <li>Busca por nome em clientes e empreendimentos.</li>
          </ul>
        </div>

        <div class="site-janela" v-revelar>
          <div class="site-janela-barra">Empreendimento</div>
          <div class="site-janela-corpo">
            <h3>Residencial Ipê</h3>
            <dl class="site-janela-dados">
              <div v-for="[rotulo, valor] in EMPREENDIMENTO" :key="rotulo">
                <dt>{{ rotulo }}</dt>
                <dd>{{ valor }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>

    <section class="site-secao clara">
      <div class="site-container site-dupla invertida">
        <SiteMemorial />
        <div class="site-dupla-texto" v-revelar>
          <h2>Memoriais de cálculo em PDF</h2>
          <p>
            Cada cálculo gera o próprio memorial, com cliente, empreendimento, dados de entrada e
            resultado. O rodapé lembra que a validação técnica é do responsável pelo projeto.
          </p>
          <ul class="site-lista-marcas">
            <li>Baixado direto da lista de cálculos do empreendimento.</li>
            <li>Sempre com os valores salvos mais recentes.</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="site-secao">
      <div class="site-container site-dupla">
        <div class="site-dupla-texto" v-revelar>
          <h2>Orçamentos</h2>
          <p>
            Monte o orçamento pelo número de apartamentos ou pela área, com valor unitário e
            validade em dias. O PDF sai pronto para enviar ao cliente.
          </p>
          <ul class="site-lista-marcas">
            <li>Situações de rascunho, enviado, aprovado e recusado.</li>
            <li>Totais em aberto e aprovados no painel inicial.</li>
            <li>Aviso dos orçamentos que passaram da validade sem resposta.</li>
          </ul>
        </div>

        <div class="site-janela" v-revelar>
          <div class="site-janela-barra">Orçamentos</div>
          <ul class="site-janela-lista">
            <li v-for="orcamento in ORCAMENTOS" :key="orcamento.nome">
              <div>
                <strong>{{ orcamento.nome }}</strong>
                <span>{{ orcamento.detalhe }}</span>
              </div>
              <span class="site-situacao" :data-situacao="orcamento.situacao">
                {{ STATUS_ORCAMENTO[orcamento.situacao] }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="site-secao clara">
      <div class="site-container site-dupla invertida">
        <div class="site-janela" v-revelar>
          <div class="site-janela-barra">Tabelas normativas — NBR 13969, Tabela A.1</div>
          <table class="site-janela-tabela">
            <thead>
              <tr>
                <th>Percolação (min/m)</th>
                <th>Tx (m³/m²·dia)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="[percolacao, taxa] in PERCOLACAO" :key="percolacao">
                <td>até {{ percolacao }}</td>
                <td>{{ taxa }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="site-dupla-texto" v-revelar>
          <h2>Tabelas normativas</h2>
          <p>
            As tabelas das NBRs usadas pelos cálculos ficam à mão, com busca e filtro. São as mesmas
            que o sistema consulta, então dá para conferir de onde saiu cada valor.
          </p>
        </div>
      </div>
    </section>

    <section class="site-secao">
      <div class="site-container">
        <header class="site-secao-cabecalho" v-revelar>
          <h2>Equipe, perfis e auditoria</h2>
          <p>
            Cada pessoa entra por convite e define a própria senha. O perfil decide o que ela vê no
            menu.
          </p>
        </header>

        <div class="site-tabela-rolagem" v-revelar>
          <table class="site-comparativo">
            <thead>
              <tr>
                <th>Área do sistema</th>
                <th>Engenheiro</th>
                <th>Administrador</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="[area, engenheiro] in PERFIS_ACESSO" :key="area">
                <td>{{ area }}</td>
                <td>{{ engenheiro ? 'Sim' : '—' }}</td>
                <td>Sim</td>
              </tr>
            </tbody>
          </table>
        </div>

        <ul class="site-grade-info tres">
          <li v-revelar>
            <h3>Auditoria</h3>
            <p>Quem criou, alterou ou excluiu cada registro, e quando.</p>
          </li>
          <li v-revelar>
            <h3>Painel inicial</h3>
            <p>
              Clientes, empreendimentos, cálculos por tipo e os últimos empreendimentos cadastrados.
            </p>
          </li>
          <li v-revelar>
            <h3>Dados separados</h3>
            <p>Cada escritório tem o próprio banco de dados, e a sessão expira por inatividade.</p>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup>
import SiteMemorial from '@/site/components/SiteMemorial.vue'
import vRevelar from '@/site/diretivas/revelar'
import { STATUS_ORCAMENTO } from '@/constants/opcoes'

const EMPREENDIMENTO = [
  ['Cliente', 'Construtora Aroeira'],
  ['Tipo', 'Prédio'],
  ['Pavimentos', '12'],
  ['Concessionária', 'DMAE — Uberlândia/MG'],
  ['Unidades', '48'],
  ['Taxa de ocupação', '4 hab/unidade'],
  ['Consumo per capita', '200 L/hab·dia'],
]

const ORCAMENTOS = [
  { nome: 'Residencial Ipê', detalhe: '48 apartamentos', situacao: 'APROVADO' },
  { nome: 'Galpão Distrito Industrial', detalhe: '1.850 m²', situacao: 'ENVIADO' },
  { nome: 'Casa Jardim Karaíba', detalhe: '240 m²', situacao: 'RASCUNHO' },
  { nome: 'Edifício Central', detalhe: '32 apartamentos', situacao: 'RECUSADO' },
]

const PERCOLACAO = [
  [40, '0,20'],
  [80, '0,14'],
  [120, '0,12'],
  [160, '0,10'],
  [200, '0,09'],
  [400, '0,065'],
  [600, '0,053'],
]

const PERFIS_ACESSO = [
  ['Clientes, empreendimentos e cálculos', true],
  ['Memoriais em PDF', true],
  ['Assistente de IA', true],
  ['Tabelas normativas', true],
  ['Orçamentos', false],
  ['Usuários da equipe', false],
  ['Auditoria', false],
  ['Assinatura', false],
]
</script>
