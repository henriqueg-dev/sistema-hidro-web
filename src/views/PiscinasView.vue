<template>
  <AppLayout>
    <RouterLink class="voltar" :to="{ name: 'empreendimento-detalhe', params: { id } }">
      &larr; {{ empreendimento?.nome ?? 'Empreendimento' }}
    </RouterLink>

    <h1 class="page-title">Piscinas</h1>
    <p class="subtitle">
      Dimensionamento do conjunto de recirculação conforme a ABNT NBR 10339: vazão de projeto,
      diâmetros de sucção e recalque, dispositivos e perda de carga trecho a trecho.
    </p>

    <p v-if="carregando" class="subtitle">Carregando...</p>

    <template v-else>
      <section v-if="!piscinas.length && !formAberto" class="card">
        <div class="estado-vazio">
          <strong>Nenhuma piscina dimensionada</strong>
          <span>Cadastre a primeira piscina deste empreendimento.</span>
          <button type="button" @click="novaPiscina">Nova piscina</button>
        </div>
      </section>

      <section v-for="piscina in piscinas" :key="piscina.id" class="card">
        <div class="card-header">
          <div class="card-header-titulo">
            <h2>{{ piscina.nome }}</h2>
            <p class="subtitle">{{ piscina.tipoUso }}</p>
          </div>
          <span v-if="paraRemover === piscina.id" class="confirmacao">
            <span>Remover esta piscina e seus trechos?</span>
            <button
              type="button"
              class="btn-link perigo"
              :disabled="removendo"
              @click="handleExcluir(piscina)"
            >
              {{ removendo ? 'Removendo...' : 'Sim, remover' }}
            </button>
            <button type="button" class="btn-link" @click="paraRemover = null">Cancelar</button>
          </span>

          <span v-else class="confirmacao">
            <button type="button" class="btn-link" @click="editarPiscina(piscina)">Alterar</button>
            <button type="button" class="btn-link perigo" @click="paraRemover = piscina.id">
              Remover
            </button>
          </span>
        </div>

        <div class="calculo-corpo">
          <div class="calculo-destaque">
            <span>Pressão que sobra no bocal mais distante</span>
            <strong>{{ formatar(piscina.pressaoResidualMca, 2) }} mca</strong>
            <small>depois de {{ piscina.trechos.length }} trecho(s) de tubulação</small>
          </div>

          <dl class="calculo-dados">
            <div>
              <dt>Área da lâmina d'água</dt>
              <dd>{{ formatar(piscina.areaM2, 2) }} m²</dd>
            </div>
            <div>
              <dt>Volume de água</dt>
              <dd>{{ formatar(piscina.volumeM3, 2) }} m³</dd>
            </div>
            <div>
              <dt>Vazão necessária (calculada)</dt>
              <dd>{{ formatar(piscina.vazaoProjetoM3h, 2) }} m³/h</dd>
            </div>
            <div>
              <dt>Vazão da bomba (adotada)</dt>
              <dd>{{ formatar(piscina.vazaoBombaM3h, 2) }} m³/h</dd>
            </div>
            <div>
              <dt>Tempo de recirculação</dt>
              <dd>
                {{ piscina.tempoFiltracaoH }} h
                <small>máximo permitido: {{ piscina.tempoMaximoFiltracaoH }} h</small>
              </dd>
            </div>
            <div>
              <dt>Tubulação de recalque (retorno)</dt>
              <dd>
                DN {{ piscina.dnRecalqueMm }} mm
                <small>
                  água a {{ formatar(piscina.velocidadeRecalqueMs, 2) }} m/s — limite 3,0 m/s
                </small>
              </dd>
            </div>
            <div>
              <dt>Tubulação de sucção</dt>
              <dd>
                DN {{ piscina.dnSuccaoMm }} mm
                <small>
                  água a {{ formatar(piscina.velocidadeSuccaoMs, 2) }} m/s — limite 1,8 m/s
                </small>
              </dd>
            </div>
          </dl>
        </div>

        <h3 class="titulo-secao">
          Dispositivos a instalar&nbsp;<span
            class="dica"
            title="O número em destaque é o que vai para o projeto. Abaixo dele, o valor que o cálculo devolveu antes do arredondamento e dos mínimos da norma."
          >
            ?
          </span>
        </h3>

        <dl class="calculo-dados dispositivos">
          <div>
            <dt>Bocais de retorno</dt>
            <dd>
              {{ piscina.numBocaisRetornoAdotado }}
              <small>
                cálculo: {{ formatar(piscina.numBocaisRetornoCalculado, 2) }} — por vazão
                {{ formatar(piscina.numBocaisPorVazao, 2) }}, por área
                {{ formatar(piscina.numBocaisPorArea, 2) }}
              </small>
            </dd>
          </div>
          <div>
            <dt>Skimmers</dt>
            <dd>
              {{ piscina.numSkimmersAdotado }}
              <small>cálculo: {{ formatar(piscina.numSkimmersCalculado, 2) }}</small>
            </dd>
          </div>
          <div>
            <dt>Ralos de fundo</dt>
            <dd>
              {{ piscina.numRalosAdotado }}
              <small>cálculo: {{ formatar(piscina.numRalosCalculado, 2) }}</small>
            </dd>
          </div>
          <div>
            <dt>Aspiradores</dt>
            <dd>
              {{ piscina.numAspiradores }}
              <small>definido no projeto</small>
            </dd>
          </div>
        </dl>

        <p v-for="(alerta, indice) in piscina.alertas" :key="indice" class="msg aviso">
          {{ alerta }}
        </p>

        <details v-if="piscina.trechos.length" class="bloco-tabela">
          <summary>Perda de carga trecho a trecho</summary>
          <p class="subtitle">
            A pressão sai da bomba e vai sendo consumida a cada trecho. O que sobra no fim é a
            pressão no bocal mais distante.
          </p>
          <div class="tabela-rolagem">
            <table class="tabela">
              <thead>
                <tr>
                  <th title="Nome do trecho, do ralo de fundo até o bocal de retorno">Trecho</th>
                  <th title="Sucção vem antes da bomba; recalque vem depois dela">Sentido</th>
                  <th title="Vazão que passa neste trecho">Vazão (m³/h)</th>
                  <th title="Diâmetro nominal do tubo comercial">DN (mm)</th>
                  <th title="Diâmetro interno real do tubo, usado no cálculo">Interno (mm)</th>
                  <th title="Velocidade da água: máx. 1,8 m/s na sucção e 3,0 m/s no recalque">
                    Velocidade (m/s)
                  </th>
                  <th title="Perda de carga por metro de tubo (fórmula de Fair-Whipple-Hsiao)">
                    Perda por metro
                  </th>
                  <th title="Conexões convertidas em metros de tubo reto">Conexões (m)</th>
                  <th title="Comprimento físico do tubo">Tubo (m)</th>
                  <th title="Conexões + tubo: é o que multiplica a perda por metro">Total (m)</th>
                  <th title="Pressão perdida neste trecho">Perda no trecho (m)</th>
                  <th title="Pressão disponível ao entrar no trecho">Pressão entra (mca)</th>
                  <th title="Pressão que sobra ao sair: vira a de entrada do trecho seguinte">
                    Pressão sai (mca)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="trecho in piscina.trechos" :key="trecho.id">
                  <td>{{ trecho.nome }}</td>
                  <td>{{ trecho.sentido }}</td>
                  <td>{{ formatar(trecho.vazaoM3h, 3) }}</td>
                  <td>{{ trecho.dnMm }}</td>
                  <td>{{ formatar(trecho.diametroInternoMm, 1) }}</td>
                  <td>{{ formatar(trecho.velocidadeMs, 3) }}</td>
                  <td>{{ formatar(trecho.perdaUnitariaMM, 6) }}</td>
                  <td>{{ formatar(trecho.lEquivalenteM, 2) }}</td>
                  <td>{{ formatar(trecho.lRealM, 2) }}</td>
                  <td>{{ formatar(trecho.lTotalM, 2) }}</td>
                  <td>{{ formatar(trecho.hfM, 4) }}</td>
                  <td>{{ formatar(trecho.pressaoMontanteMca, 3) }}</td>
                  <td>{{ formatar(trecho.pressaoJusanteMca, 3) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <dl class="legenda">
            <div>
              <dt>Sentido</dt>
              <dd>
                Sucção é o caminho antes da bomba (velocidade máxima de 1,8 m/s); recalque é
                depois dela, até o bocal (máximo de 3,0 m/s).
              </dd>
            </div>
            <div>
              <dt>Interno</dt>
              <dd>
                Diâmetro real por dentro do tubo, menor que o nominal. É ele que entra na conta,
                não o DN.
              </dd>
            </div>
            <div>
              <dt>Perda por metro</dt>
              <dd>
                Quanto de pressão cada metro de tubo consome, pela fórmula de
                Fair-Whipple-Hsiao para PVC. Cresce rápido quando o diâmetro diminui.
              </dd>
            </div>
            <div>
              <dt>Conexões</dt>
              <dd>
                Joelhos, tês e registros não têm comprimento útil, mas atrapalham o fluxo. Cada um
                é convertido no tanto de tubo reto que causaria a mesma perda.
              </dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>Conexões mais tubo. É o número que multiplica a perda por metro.</dd>
            </div>
            <div>
              <dt>Perda no trecho</dt>
              <dd>Perda por metro × total. É o quanto de pressão esse trecho custa.</dd>
            </div>
            <div>
              <dt>Pressão entra e sai</dt>
              <dd>
                O primeiro trecho entra com a altura manométrica da bomba. Depois, a pressão que
                sai de um é a que entra no seguinte: sai = entra ± desnível − perda do trecho.
              </dd>
            </div>
          </dl>
        </details>
      </section>

      <button
        v-if="piscinas.length && !formAberto"
        type="button"
        class="btn acao-solta"
        @click="novaPiscina"
      >
        Nova piscina
      </button>

      <section v-if="formAberto" class="card">
        <h2>{{ form.id ? 'Alterar piscina' : 'Nova piscina' }}</h2>
        <p class="subtitle">
          Preencha as medidas da piscina e os dados da bomba escolhida no catálogo. O sistema
          calcula a vazão necessária, os diâmetros das tubulações e quantos dispositivos instalar.
        </p>

        <form @submit.prevent="handleSalvar">
          <div class="form-linha">
            <div class="field amplo">
              <label for="nome">Nome</label>
              <input id="nome" v-model="form.nome" type="text" placeholder="Adulto" />
            </div>

            <div class="field amplo">
              <label for="tipoUso">Tipo de uso</label>
              <select id="tipoUso" v-model="form.tipoUso">
                <option
                  v-for="tipo in referencias?.tempoFiltracao ?? []"
                  :key="tipo.tipo"
                  :value="tipo.tipo"
                >
                  {{ tipo.descricao }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-linha">
            <div class="field estreito">
              <label for="larguraM">Largura (m)</label>
              <input
                id="larguraM"
                v-model.number="form.larguraM"
                type="number"
                step="0.01"
                min="0"
              />
            </div>
            <div class="field estreito">
              <label for="comprimentoM">Comprimento (m)</label>
              <input
                id="comprimentoM"
                v-model.number="form.comprimentoM"
                type="number"
                step="0.01"
                min="0"
              />
            </div>
            <div class="field estreito">
              <label for="profundidadeM">Profundidade (m)</label>
              <input
                id="profundidadeM"
                v-model.number="form.profundidadeM"
                type="number"
                step="0.01"
                min="0"
              />
            </div>
            <div class="field medio">
              <label for="tempoFiltracaoH">
                Tempo de recirculação (h)&nbsp;<span
                  class="dica"
                  title="Em quantas horas todo o volume da piscina passa pelo filtro. O máximo depende do tipo de uso e da profundidade."
                >
                  ?
                </span>
              </label>
              <input
                id="tempoFiltracaoH"
                v-model.number="form.tempoFiltracaoH"
                type="number"
                min="1"
              />
            </div>
            <div class="field medio">
              <label for="areaPorSkimmerM2">
                Área por skimmer (m²)&nbsp;<span
                  class="dica"
                  title="Quantos m² de superfície cada skimmer atende. 50 m² em piscina residencial; 25 m² em piscina pública."
                >
                  ?
                </span>
              </label>
              <input
                id="areaPorSkimmerM2"
                v-model.number="form.areaPorSkimmerM2"
                type="number"
                min="1"
              />
            </div>
          </div>

          <p v-if="previa" class="subtitle">
            Com essas medidas: área de {{ formatar(previa.area, 2) }} m², volume de
            {{ formatar(previa.volume, 2) }} m³, e a bomba precisa dar no mínimo
            <strong>{{ formatar(previa.vazaoProjeto, 2) }} m³/h</strong>. O tempo de recirculação
            para este tipo de piscina não pode passar de
            <strong>{{ previa.tempoMaximo }} h</strong>.
          </p>

          <div class="form-linha">
            <div class="field medio">
              <label for="vazaoBombaM3h">
                Vazão da bomba (m³/h)&nbsp;<span
                  class="dica"
                  title="Vazão da bomba escolhida no catálogo do fornecedor. Precisa ser igual ou maior que a vazão de projeto calculada acima."
                >
                  ?
                </span>
              </label>
              <input
                id="vazaoBombaM3h"
                v-model.number="form.vazaoBombaM3h"
                type="number"
                step="0.1"
                min="0"
              />
            </div>
            <div class="field medio">
              <label for="alturaManometricaMca">
                Altura manométrica (mca)&nbsp;<span
                  class="dica"
                  title="Pressão que a bomba entrega, em metros de coluna d'água, também lida no catálogo. É a pressão de partida do primeiro trecho."
                >
                  ?
                </span>
              </label>
              <input
                id="alturaManometricaMca"
                v-model.number="form.alturaManometricaMca"
                type="number"
                step="0.1"
                min="0"
              />
            </div>
            <div class="field estreito">
              <label for="numAspiradores">
                Aspiradores&nbsp;<span
                  class="dica"
                  title="Quantidade definida no projeto: um a cada 10 m de raio de alcance da mangueira."
                >
                  ?
                </span>
              </label>
              <input
                id="numAspiradores"
                v-model.number="form.numAspiradores"
                type="number"
                min="0"
              />
            </div>
          </div>

          <details class="bloco-tabela">
            <summary>Sobrescrever dispositivos (opcional)</summary>
            <p class="subtitle">
              Em branco, o sistema adota o valor calculado arredondado para cima, respeitando os
              mínimos da norma. Preencha apenas para fixar um valor de projeto diferente.
            </p>
            <div class="form-linha">
              <div class="field estreito">
                <label for="numBocaisRetornoAdotado">Bocais de retorno</label>
                <input
                  id="numBocaisRetornoAdotado"
                  v-model.number="form.numBocaisRetornoAdotado"
                  type="number"
                  min="0"
                />
              </div>
              <div class="field estreito">
                <label for="numSkimmersAdotado">Skimmers</label>
                <input
                  id="numSkimmersAdotado"
                  v-model.number="form.numSkimmersAdotado"
                  type="number"
                  min="0"
                />
              </div>
              <div class="field estreito">
                <label for="numRalosAdotado">Ralos de fundo</label>
                <input
                  id="numRalosAdotado"
                  v-model.number="form.numRalosAdotado"
                  type="number"
                  min="0"
                />
              </div>
            </div>
          </details>

          <h3 class="titulo-secao">Trechos</h3>
          <p class="subtitle">
            Do ralo de fundo até o bocal de retorno mais desfavorável. A pressão de cada trecho
            parte da do anterior; o primeiro parte da altura manométrica da bomba.
          </p>

          <article v-for="(trecho, indice) in form.trechos" :key="indice" class="trecho-editor">
            <div class="trecho-cabecalho">
              <span class="badge">Trecho {{ indice + 1 }}</span>
              <button type="button" class="btn-link perigo" @click="removerTrecho(indice)">
                Remover trecho
              </button>
            </div>

            <div class="form-linha">
              <div class="field amplo">
                <label :for="`trecho-nome-${indice}`">Nome</label>
                <input
                  :id="`trecho-nome-${indice}`"
                  v-model="trecho.nome"
                  type="text"
                  placeholder="Ralo-tê"
                />
              </div>
              <div class="field">
                <label :for="`trecho-sentido-${indice}`">Sentido</label>
                <select :id="`trecho-sentido-${indice}`" v-model="trecho.sentido">
                  <option v-for="(rotulo, valor) in SENTIDOS_TRECHO" :key="valor" :value="valor">
                    {{ rotulo }}
                  </option>
                </select>
              </div>
              <div class="field estreito">
                <label :for="`trecho-vazao-${indice}`">
                  Vazão no trecho (m³/h)&nbsp;<span
                    class="dica"
                    title="Vazão que passa neste trecho. Pode ser uma fração da vazão da bomba, quando ela se divide entre ralos ou bocais."
                  >
                    ?
                  </span>
                </label>
                <input
                  :id="`trecho-vazao-${indice}`"
                  v-model.number="trecho.vazaoM3h"
                  type="number"
                  step="0.001"
                  min="0"
                />
              </div>
              <div class="field">
                <label :for="`trecho-dn-${indice}`">Diâmetro do tubo</label>
                <select :id="`trecho-dn-${indice}`" v-model.number="trecho.dnMm">
                  <option v-for="d in referencias?.diametros ?? []" :key="d.dn" :value="d.dn">
                    DN {{ d.dn }} mm — interno {{ d.diametroInternoMm }} mm
                  </option>
                </select>
              </div>
              <div class="field estreito">
                <label :for="`trecho-desnivel-${indice}`">
                  Desnível (m)&nbsp;<span
                    class="dica"
                    title="Diferença de altura entre o início e o fim do trecho. Positivo quando sobe, negativo quando desce."
                  >
                    ?
                  </span>
                </label>
                <input
                  :id="`trecho-desnivel-${indice}`"
                  v-model.number="trecho.desnivelM"
                  type="number"
                  step="0.01"
                />
              </div>
              <div class="field medio">
                <label :for="`trecho-lreal-${indice}`">
                  Comprimento de tubo (m)
                  <span class="dica" title="Comprimento físico do tubo, medido no projeto.">?</span>
                </label>
                <input
                  :id="`trecho-lreal-${indice}`"
                  v-model.number="trecho.lRealM"
                  type="number"
                  step="0.01"
                  min="0"
                />
              </div>
              <div class="field medio">
                <label :for="`trecho-ladicional-${indice}`">
                  Comprimento equivalente (m)&nbsp;<span
                    class="dica"
                    title="Perda localizada que você não vai lançar conexão por conexão abaixo — some aqui, já em metros de tubo equivalente."
                  >
                    ?
                  </span>
                </label>
                <input
                  :id="`trecho-ladicional-${indice}`"
                  v-model.number="trecho.lEquivalenteAdicionalM"
                  type="number"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div class="conexoes">
              <div
                v-for="(conexao, ic) in trecho.conexoes"
                :key="ic"
                class="form-linha conexao-linha"
              >
                <div class="field amplo">
                  <label :for="`conexao-tipo-${indice}-${ic}`">Conexão</label>
                  <select :id="`conexao-tipo-${indice}-${ic}`" v-model="conexao.tipo">
                    <option v-for="c in referencias?.conexoes ?? []" :key="c.tipo" :value="c.tipo">
                      {{ c.descricao }}
                    </option>
                  </select>
                </div>
                <div class="field estreito">
                  <label :for="`conexao-qtd-${indice}-${ic}`">Qtd.</label>
                  <input
                    :id="`conexao-qtd-${indice}-${ic}`"
                    v-model.number="conexao.quantidade"
                    type="number"
                    min="1"
                  />
                </div>
                <div class="field">
                  <label>
                    Equivale a&nbsp;<span
                      class="dica"
                      title="Quantos metros de tubo reto esta conexão representa em perda de carga, no diâmetro do trecho."
                    >
                      ?
                    </span>
                  </label>
                  <output>{{ formatar(comprimentoConexao(conexao, trecho.dnMm), 2) }} m de tubo</output>
                </div>
                <div class="field actions">
                  <button
                    type="button"
                    class="btn-link perigo"
                    @click="trecho.conexoes.splice(ic, 1)"
                  >
                    Remover
                  </button>
                </div>
              </div>

              <button type="button" class="btn-secundario" @click="adicionarConexao(trecho)">
                Adicionar conexão
              </button>
              <span class="subtitle total-conexoes">
                L equivalente do trecho: {{ formatar(lEquivalenteTrecho(trecho), 2) }} m
              </span>
            </div>
          </article>

          <button type="button" class="btn-secundario btn-acao" @click="adicionarTrecho">
            Adicionar trecho
          </button>

          <p v-if="erro" class="msg erro">{{ erro }}</p>

          <div class="form-linha acoes-form">
            <button type="submit" class="btn-acao" :disabled="salvando">
              {{ salvando ? 'Calculando...' : 'Calcular e salvar' }}
            </button>
            <button type="button" class="btn-secundario" @click="cancelar">Cancelar</button>
          </div>
        </form>
      </section>

      <section v-if="referencias" class="card">
        <h2>Tabelas de referência</h2>

        <details class="bloco-tabela">
          <summary>Tabela 1 — tempo máximo de filtração (h)</summary>
          <div class="tabela-rolagem">
            <table class="tabela">
              <thead>
                <tr>
                  <th>Tipologia</th>
                  <th>Até 0,60 m</th>
                  <th>0,60 a 1,50 m</th>
                  <th>Acima de 1,50 m</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="linha in referencias.tempoFiltracao" :key="linha.tipo">
                  <td>{{ linha.descricao }}</td>
                  <td>{{ linha.ate060 }}</td>
                  <td>{{ linha.de060a150 }}</td>
                  <td>{{ linha.acima150 }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>

        <details class="bloco-tabela">
          <summary>Faixas de vazão por diâmetro</summary>
          <div class="tabela-rolagem">
            <table class="tabela">
              <thead>
                <tr>
                  <th>Vazão da bomba (m³/h)</th>
                  <th>DN recalque</th>
                  <th>Vazão da bomba (m³/h)</th>
                  <th>DN sucção</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(faixa, i) in referencias.faixasRecalque" :key="i">
                  <td>{{ faixa.de }} a {{ faixa.ate }}</td>
                  <td>{{ faixa.dn }}</td>
                  <td>
                    {{ referencias.faixasSuccao[i].de }} a {{ referencias.faixasSuccao[i].ate }}
                  </td>
                  <td>{{ referencias.faixasSuccao[i].dn }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="subtitle">
            Velocidade máxima: {{ referencias.velocidadeMaximaSuccaoMs }} m/s na sucção e
            {{ referencias.velocidadeMaximaRecalqueMs }} m/s no recalque.
          </p>
        </details>

        <details class="bloco-tabela">
          <summary>Comprimento equivalente por conexão (m)</summary>
          <div class="tabela-rolagem">
            <table class="tabela">
              <thead>
                <tr>
                  <th>Conexão</th>
                  <th v-for="dn in referencias.diametrosTabelados" :key="dn">{{ dn }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="linha in referencias.conexoes" :key="linha.tipo">
                  <td>{{ linha.descricao }}</td>
                  <td v-for="(valor, i) in linha.comprimentos" :key="i">{{ valor }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>
      </section>
    </template>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import * as piscinaService from '@/services/piscinaService'
import * as empreendimentoService from '@/services/empreendimentoService'
import { SENTIDOS_TRECHO } from '@/constants/opcoes'

const props = defineProps({
  id: { type: String, required: true },
})

const FORM_VAZIO = {
  id: null,
  nome: '',
  tipoUso: 'PUBLICA_COLETIVA',
  larguraM: null,
  comprimentoM: null,
  profundidadeM: null,
  tempoFiltracaoH: null,
  vazaoBombaM3h: null,
  alturaManometricaMca: null,
  areaPorSkimmerM2: 50,
  numBocaisRetornoAdotado: null,
  numSkimmersAdotado: null,
  numRalosAdotado: null,
  numAspiradores: 1,
  trechos: [],
}

const empreendimento = ref(null)
const piscinas = ref([])
const referencias = ref(null)
const carregando = ref(true)
const salvando = ref(false)
const erro = ref('')
const formAberto = ref(false)
const form = ref(clonar(FORM_VAZIO))

// Remoção em dois passos, como nos demais cálculos: apagar a piscina leva junto
// todos os trechos e conexões dela.
const paraRemover = ref(null)
const removendo = ref(false)

function clonar(valor) {
  return JSON.parse(JSON.stringify(valor))
}

function formatar(valor, casas) {
  if (valor === null || valor === undefined) return '—'
  return Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })
}

/** Prévia local, só para orientar o preenchimento — o cálculo oficial é do backend. */
const previa = computed(() => {
  const { larguraM, comprimentoM, profundidadeM, tempoFiltracaoH, tipoUso } = form.value
  if (!larguraM || !comprimentoM || !profundidadeM || !tempoFiltracaoH) return null

  const area = larguraM * comprimentoM
  const volume = area * profundidadeM
  const linha = referencias.value?.tempoFiltracao?.find((t) => t.tipo === tipoUso)

  let tempoMaximo = '—'
  if (linha) {
    if (profundidadeM <= 0.6) tempoMaximo = linha.ate060
    else if (profundidadeM <= 1.5) tempoMaximo = linha.de060a150
    else tempoMaximo = linha.acima150
  }

  return { area, volume, vazaoProjeto: volume / tempoFiltracaoH, tempoMaximo }
})

function comprimentoConexao(conexao, dn) {
  const linha = referencias.value?.conexoes?.find((c) => c.tipo === conexao.tipo)
  const indice = referencias.value?.diametrosTabelados?.indexOf(dn)
  if (!linha || indice === undefined || indice < 0) return 0
  return (conexao.quantidade ?? 0) * linha.comprimentos[indice]
}

function lEquivalenteTrecho(trecho) {
  const conexoes = trecho.conexoes.reduce(
    (total, conexao) => total + comprimentoConexao(conexao, trecho.dnMm),
    0,
  )
  return conexoes + (trecho.lEquivalenteAdicionalM ?? 0)
}

function adicionarTrecho() {
  form.value.trechos.push({
    nome: '',
    sentido: 'SUCCAO',
    vazaoM3h: form.value.vazaoBombaM3h,
    dnMm: referencias.value?.diametros?.[0]?.dn ?? 50,
    desnivelM: 0,
    lRealM: 0,
    lEquivalenteAdicionalM: 0,
    conexoes: [],
  })
}

function removerTrecho(indice) {
  form.value.trechos.splice(indice, 1)
}

function adicionarConexao(trecho) {
  trecho.conexoes.push({
    tipo: referencias.value?.conexoes?.[0]?.tipo ?? 'JOELHO_90',
    quantidade: 1,
  })
}

function novaPiscina() {
  form.value = clonar(FORM_VAZIO)
  formAberto.value = true
  erro.value = ''
}

function editarPiscina(piscina) {
  form.value = {
    id: piscina.id,
    // A resposta traz a descrição do enum; o select trabalha com o nome.
    nome: piscina.nome,
    tipoUso: tipoUsoPorDescricao(piscina.tipoUso),
    larguraM: piscina.larguraM,
    comprimentoM: piscina.comprimentoM,
    profundidadeM: piscina.profundidadeM,
    tempoFiltracaoH: piscina.tempoFiltracaoH,
    vazaoBombaM3h: piscina.vazaoBombaM3h,
    alturaManometricaMca: piscina.alturaManometricaMca,
    areaPorSkimmerM2: piscina.areaPorSkimmerM2,
    numBocaisRetornoAdotado: piscina.numBocaisRetornoInformado,
    numSkimmersAdotado: piscina.numSkimmersInformado,
    numRalosAdotado: piscina.numRalosInformado,
    numAspiradores: piscina.numAspiradores,
    trechos: piscina.trechos.map((trecho) => ({
      nome: trecho.nome,
      sentido: sentidoPorDescricao(trecho.sentido),
      vazaoM3h: trecho.vazaoM3h,
      dnMm: trecho.dnMm,
      desnivelM: trecho.desnivelM,
      lRealM: trecho.lRealM,
      lEquivalenteAdicionalM: trecho.lEquivalenteAdicionalM,
      conexoes: trecho.conexoes.map((conexao) => ({
        tipo: tipoConexaoPorDescricao(conexao.tipo),
        quantidade: conexao.quantidade,
      })),
    })),
  }
  formAberto.value = true
  erro.value = ''
}

function tipoUsoPorDescricao(descricao) {
  const linha = referencias.value?.tempoFiltracao?.find(
    (t) => t.descricao === descricao || t.tipo === descricao,
  )
  return linha?.tipo ?? 'PUBLICA_COLETIVA'
}

function tipoConexaoPorDescricao(descricao) {
  const linha = referencias.value?.conexoes?.find(
    (c) => c.descricao === descricao || c.tipo === descricao,
  )
  return linha?.tipo ?? 'JOELHO_90'
}

function sentidoPorDescricao(descricao) {
  const entrada = Object.entries(SENTIDOS_TRECHO).find(
    ([valor, rotulo]) => valor === descricao || rotulo.startsWith(descricao),
  )
  return entrada?.[0] ?? 'SUCCAO'
}

function cancelar() {
  formAberto.value = false
  form.value = clonar(FORM_VAZIO)
  erro.value = ''
}

async function carregarTudo() {
  carregando.value = true
  try {
    const [dadosEmpreendimento, dadosReferencias, dadosPiscinas] = await Promise.all([
      empreendimentoService.buscarPorId(props.id),
      piscinaService.referencias(),
      piscinaService.listarPorEmpreendimento(props.id),
    ])
    empreendimento.value = dadosEmpreendimento
    referencias.value = dadosReferencias
    piscinas.value = dadosPiscinas
  } catch {
    erro.value = 'Não foi possível carregar os dados das piscinas.'
  } finally {
    carregando.value = false
  }
}

async function handleSalvar() {
  erro.value = ''
  salvando.value = true

  const { id, ...dados } = form.value
  const corpo = { ...dados, empreendimentoId: Number(props.id) }

  try {
    if (id) {
      await piscinaService.atualizar(id, corpo)
    } else {
      await piscinaService.criar(corpo)
    }
    piscinas.value = await piscinaService.listarPorEmpreendimento(props.id)
    cancelar()
  } catch (error) {
    erro.value = error.response?.data?.mensagem ?? 'Não foi possível calcular a piscina.'
  } finally {
    salvando.value = false
  }
}

async function handleExcluir(piscina) {
  erro.value = ''
  removendo.value = true

  try {
    await piscinaService.excluir(piscina.id)
    // O formulário pode estar aberto justamente sobre a piscina removida.
    if (form.value.id === piscina.id) cancelar()
    piscinas.value = await piscinaService.listarPorEmpreendimento(props.id)
    paraRemover.value = null
  } catch {
    erro.value = 'Não foi possível remover a piscina.'
  } finally {
    removendo.value = false
  }
}

onMounted(carregarTudo)
</script>
