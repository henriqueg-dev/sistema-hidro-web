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
            <span>Pressão residual no bocal</span>
            <strong>{{ formatar(piscina.pressaoResidualMca, 2) }} mca</strong>
            <small>{{ piscina.trechos.length }} trecho(s) calculado(s)</small>
          </div>

          <dl class="calculo-dados">
            <div>
              <dt>Área</dt>
              <dd>{{ formatar(piscina.areaM2, 2) }} m²</dd>
            </div>
            <div>
              <dt>Volume</dt>
              <dd>{{ formatar(piscina.volumeM3, 2) }} m³</dd>
            </div>
            <div>
              <dt>Vazão de projeto</dt>
              <dd>{{ formatar(piscina.vazaoProjetoM3h, 2) }} m³/h</dd>
            </div>
            <div>
              <dt>Vazão da bomba</dt>
              <dd>{{ formatar(piscina.vazaoBombaM3h, 2) }} m³/h</dd>
            </div>
            <div>
              <dt>Tempo filtração</dt>
              <dd>{{ piscina.tempoFiltracaoH }} h (máx {{ piscina.tempoMaximoFiltracaoH }} h)</dd>
            </div>
            <div>
              <dt>DN recalque</dt>
              <dd>
                {{ piscina.dnRecalqueMm }} mm · {{ formatar(piscina.velocidadeRecalqueMs, 2) }} m/s
              </dd>
            </div>
            <div>
              <dt>DN sucção</dt>
              <dd>
                {{ piscina.dnSuccaoMm }} mm · {{ formatar(piscina.velocidadeSuccaoMs, 2) }} m/s
              </dd>
            </div>
          </dl>
        </div>

        <dl class="calculo-dados dispositivos">
          <div>
            <dt>Bocais de retorno</dt>
            <dd>
              {{ piscina.numBocaisRetornoAdotado }}
              <small>calc. {{ formatar(piscina.numBocaisRetornoCalculado, 2) }}</small>
            </dd>
          </div>
          <div>
            <dt>Skimmers</dt>
            <dd>
              {{ piscina.numSkimmersAdotado }}
              <small>calc. {{ formatar(piscina.numSkimmersCalculado, 2) }}</small>
            </dd>
          </div>
          <div>
            <dt>Ralos de fundo</dt>
            <dd>
              {{ piscina.numRalosAdotado }}
              <small>calc. {{ formatar(piscina.numRalosCalculado, 2) }}</small>
            </dd>
          </div>
          <div>
            <dt>Aspiradores</dt>
            <dd>{{ piscina.numAspiradores }}</dd>
          </div>
        </dl>

        <p v-for="(alerta, indice) in piscina.alertas" :key="indice" class="msg aviso">
          {{ alerta }}
        </p>

        <details v-if="piscina.trechos.length" class="bloco-tabela">
          <summary>Perda de carga trecho a trecho</summary>
          <div class="tabela-rolagem">
            <table class="tabela">
              <thead>
                <tr>
                  <th>Trecho</th>
                  <th>Sentido</th>
                  <th>Q (m³/h)</th>
                  <th>DN</th>
                  <th>Ø int.</th>
                  <th>V (m/s)</th>
                  <th>J (m/m)</th>
                  <th>L eq.</th>
                  <th>L real</th>
                  <th>L total</th>
                  <th>Hf (m)</th>
                  <th>P mont.</th>
                  <th>P jus.</th>
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
          O tempo de filtração é escolhido na Tabela 1 da NBR 10339; a vazão e a altura manométrica
          da bomba vêm do catálogo do fornecedor.
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
            <div class="field estreito">
              <label for="tempoFiltracaoH">Filtração (h)</label>
              <input
                id="tempoFiltracaoH"
                v-model.number="form.tempoFiltracaoH"
                type="number"
                min="1"
              />
            </div>
            <div class="field estreito">
              <label for="areaPorSkimmerM2">m²/skimmer</label>
              <input
                id="areaPorSkimmerM2"
                v-model.number="form.areaPorSkimmerM2"
                type="number"
                min="1"
              />
            </div>
          </div>

          <p v-if="previa" class="subtitle">
            Área {{ formatar(previa.area, 2) }} m² · volume {{ formatar(previa.volume, 2) }} m³ ·
            vazão de projeto <strong>{{ formatar(previa.vazaoProjeto, 2) }} m³/h</strong> · tempo
            máximo pela Tabela 1: <strong>{{ previa.tempoMaximo }} h</strong>
          </p>

          <div class="form-linha">
            <div class="field estreito">
              <label for="vazaoBombaM3h">Vazão bomba (m³/h)</label>
              <input
                id="vazaoBombaM3h"
                v-model.number="form.vazaoBombaM3h"
                type="number"
                step="0.1"
                min="0"
              />
            </div>
            <div class="field estreito">
              <label for="alturaManometricaMca">Hman (mca)</label>
              <input
                id="alturaManometricaMca"
                v-model.number="form.alturaManometricaMca"
                type="number"
                step="0.1"
                min="0"
              />
            </div>
            <div class="field estreito">
              <label for="numAspiradores">Aspiradores</label>
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
                <label :for="`trecho-vazao-${indice}`">Q (m³/h)</label>
                <input
                  :id="`trecho-vazao-${indice}`"
                  v-model.number="trecho.vazaoM3h"
                  type="number"
                  step="0.001"
                  min="0"
                />
              </div>
              <div class="field estreito">
                <label :for="`trecho-dn-${indice}`">DN</label>
                <select :id="`trecho-dn-${indice}`" v-model.number="trecho.dnMm">
                  <option v-for="d in referencias?.diametros ?? []" :key="d.dn" :value="d.dn">
                    {{ d.dn }} ({{ d.diametroInternoMm }})
                  </option>
                </select>
              </div>
              <div class="field estreito">
                <label :for="`trecho-desnivel-${indice}`">Desnível (m)</label>
                <input
                  :id="`trecho-desnivel-${indice}`"
                  v-model.number="trecho.desnivelM"
                  type="number"
                  step="0.01"
                />
              </div>
              <div class="field estreito">
                <label :for="`trecho-lreal-${indice}`">L real (m)</label>
                <input
                  :id="`trecho-lreal-${indice}`"
                  v-model.number="trecho.lRealM"
                  type="number"
                  step="0.01"
                  min="0"
                />
              </div>
              <div class="field estreito">
                <label :for="`trecho-ladicional-${indice}`">L eq. fixo (m)</label>
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
                <div class="field estreito">
                  <label>L eq.</label>
                  <output>{{ formatar(comprimentoConexao(conexao, trecho.dnMm), 2) }} m</output>
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

          <button type="button" class="btn-secundario" @click="adicionarTrecho">
            Adicionar trecho
          </button>

          <p v-if="erro" class="msg erro">{{ erro }}</p>

          <div class="form-linha acoes-form">
            <button type="submit" :disabled="salvando">
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
    numBocaisRetornoAdotado: piscina.numBocaisRetornoAdotado,
    numSkimmersAdotado: piscina.numSkimmersAdotado,
    numRalosAdotado: piscina.numRalosAdotado,
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
