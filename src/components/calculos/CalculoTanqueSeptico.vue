<template>
  <section class="card">
    <h2>Tanque séptico</h2>
    <p class="subtitle">
      Volume útil a partir das unidades de contribuição, do tipo de ocupação e do intervalo entre
      limpezas, com as dimensões internas do tanque. Volume útil mínimo de
      {{ VOLUME_MINIMO_LITROS }} L.
    </p>

    <ListaCalculos
      :calc="calc"
      descricao-vazio="Cadastre o cálculo de tanque séptico deste empreendimento."
    >
      <template #registro="{ item }">
        <div class="calculo-corpo">
          <div class="calculo-coluna">
            <div class="calculo-destaque">
              <span>Volume útil (V)</span>
              <strong>{{ item.volumeLitros }} L</strong>
              <small>{{ item.formula }}</small>
            </div>

            <div v-if="item.profundidadeAdotadaM" class="calculo-geometria">
              <h5>Geometria adotada</h5>

              <dl>
                <div>
                  <dt>Forma</dt>
                  <dd>{{ FORMAS_TANQUE[item.formaTanque] }}</dd>
                </div>
                <div>
                  <dt>Profundidade útil (h)</dt>
                  <dd>
                    {{ fmt(item.profundidadeAdotadaM) }} m
                    <small>
                      faixa {{ fmt(item.profundidadeMinimaM) }}–{{ fmt(item.profundidadeMaximaM) }} m
                    </small>
                  </dd>
                </div>
                <div v-if="item.formaTanque === 'CILINDRICO'">
                  <dt>Diâmetro interno (D)</dt>
                  <dd>{{ fmt(item.diametroM) }} m</dd>
                </div>
                <template v-else>
                  <div>
                    <dt>Dimensões internas (b &times; L)</dt>
                    <dd>{{ fmt(item.larguraM) }} &times; {{ fmt(item.comprimentoM) }} m</dd>
                  </div>
                  <div>
                    <dt>Relação L/b</dt>
                    <dd>{{ fmt(item.relacaoComprimentoLargura) }}</dd>
                  </div>
                </template>
                <div>
                  <dt>Altura construtiva</dt>
                  <dd>
                    {{ fmt(item.alturaConstrutivaM) }} m
                    <small>inclui {{ fmt(item.camaraGasesM) }} m de câmara de gases</small>
                  </dd>
                </div>
                <div>
                  <dt>Volume útil real</dt>
                  <dd>
                    {{ fmt(item.volumeRealM3, 3) }} m³
                    <small>folga de {{ fmt(item.folgaM3, 3) }} m³ ({{ item.folgaPercentual }}%)</small>
                  </dd>
                </div>
              </dl>

              <p class="calculo-nota">
                A câmara de gases não integra o volume útil.
              </p>
            </div>
          </div>

          <p v-if="item.vazaoAcimaDoMetodo" class="msg aviso">
            A contribuição diária de {{ item.contribuicaoDiariaLitros }} L/dia passa do limite de
            {{ item.vazaoMaximaLitrosDia }} L/dia previsto para este método de dimensionamento.
            Acima disso, o sistema exige solução de tratamento de maior porte.
          </p>

          <p v-if="item.volumeMinimoAplicado" class="msg aviso">
            A fórmula resultou em {{ item.volumeCalculadoLitros }} L, abaixo do mínimo admitido.
            Adotado o volume útil mínimo de {{ item.volumeMinimoLitros }} L, que é também o volume
            usado para dimensionar o tanque.
          </p>

          <div class="calculo-secoes">
            <div class="calculo-secao">
              <h4>Parâmetros adotados</h4>
              <dl class="calculo-dados">
                <div>
                  <dt>Tipo de ocupação</dt>
                  <dd>{{ TIPOS_CONTRIBUICAO[item.contribuicaoDespejo] }}</dd>
                </div>
                <div>
                  <dt>Contribuintes por unidade</dt>
                  <dd>{{ item.taxaOcupacao }}</dd>
                </div>
                <div>
                  <dt>Número de unidades</dt>
                  <dd>{{ item.numUnidades }}</dd>
                </div>
                <div>
                  <dt>Temperatura do mês mais frio</dt>
                  <dd>{{ FAIXAS_TEMPERATURA[item.faixaTemperatura] }}</dd>
                </div>
                <div>
                  <dt>Intervalo entre limpezas</dt>
                  <dd>{{ item.intervaloLimpezaAnos }} ano(s)</dd>
                </div>
              </dl>
            </div>

            <div class="calculo-secao">
              <h4>Fatores do cálculo</h4>
              <dl class="calculo-dados">
                <div>
                  <dt>N — unidades de contribuição</dt>
                  <dd>{{ item.populacao }} {{ unidade(item) }}</dd>
                </div>
                <div>
                  <dt>C — contribuição de esgoto</dt>
                  <dd>{{ item.contribuicaoLitros }} L/{{ unidadeSingular(item) }}·dia</dd>
                </div>
                <div>
                  <dt>Lf — contribuição de lodo fresco</dt>
                  <dd>{{ item.lodoFrescoLitros }} L/{{ unidadeSingular(item) }}·dia</dd>
                </div>
                <div>
                  <dt>T — período de detenção</dt>
                  <dd>{{ item.periodoDetencaoDias }} dia(s)</dd>
                </div>
                <div>
                  <dt>K — acumulação de lodo</dt>
                  <dd>{{ item.taxaAcumulacaoDias }} dias</dd>
                </div>
                <div>
                  <dt>Contribuição diária total</dt>
                  <dd>{{ item.contribuicaoDiariaLitros }} L/dia</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </template>

      <template #form>
        <div class="field amplo">
          <label for="septicoContribuicao">Tipo de ocupação</label>
          <select id="septicoContribuicao" v-model="calc.form.contribuicaoDespejo">
            <option v-for="(rotulo, valor) in TIPOS_CONTRIBUICAO" :key="valor" :value="valor">
              {{ rotulo }}
            </option>
          </select>
        </div>

        <div class="field estreito">
          <label for="septicoTaxaOcupacao">Contribuintes por unidade</label>
          <input
            id="septicoTaxaOcupacao"
            v-model.number="calc.form.taxaOcupacao"
            type="number"
            min="1"
            required
          />
        </div>

        <div class="field estreito">
          <label for="septicoNumUnidades">Número de unidades</label>
          <input
            id="septicoNumUnidades"
            v-model.number="calc.form.numUnidades"
            type="number"
            min="1"
            required
          />
        </div>

        <div class="field">
          <label for="septicoTemperatura">Temperatura do mês mais frio</label>
          <select id="septicoTemperatura" v-model="calc.form.faixaTemperatura">
            <option v-for="(rotulo, valor) in FAIXAS_TEMPERATURA" :key="valor" :value="valor">
              {{ rotulo }}
            </option>
          </select>
        </div>

        <div class="field estreito">
          <label for="septicoIntervalo">Intervalo entre limpezas (anos)</label>
          <input
            id="septicoIntervalo"
            v-model.number="calc.form.intervaloLimpezaAnos"
            type="number"
            min="1"
            max="5"
            required
          />
        </div>

        <div class="field">
          <label for="septicoForma">Forma do tanque</label>
          <select id="septicoForma" v-model="calc.form.formaTanque">
            <option v-for="(rotulo, valor) in FORMAS_TANQUE" :key="valor" :value="valor">
              {{ rotulo }}
            </option>
          </select>
        </div>

        <div class="field estreito">
          <label for="septicoProfundidade">
            Profundidade útil (m)
            <span
              class="dica"
              title="Em branco, adota a menor profundidade permitida para o volume calculado."
              aria-label="Em branco, adota a menor profundidade permitida para o volume calculado."
            >
              ?
            </span>
          </label>
          <input
            id="septicoProfundidade"
            v-model.number="calc.form.profundidadeUtilM"
            type="number"
            min="1.2"
            max="2.8"
            step="0.05"
            placeholder="Automática"
          />
        </div>
      </template>
    </ListaCalculos>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import ListaCalculos from '@/components/calculos/ListaCalculos.vue'
import { useCalculos } from '@/composables/useCalculos'
import * as tanqueSepticoService from '@/services/tanqueSepticoService'
import {
  TIPOS_CONTRIBUICAO,
  FAIXAS_TEMPERATURA,
  FORMAS_TANQUE,
  UNIDADES_CONTRIBUICAO,
} from '@/constants/opcoes'

// Limites espelhados no backend (TanqueSepticoService).
const MAX_POR_EMPREENDIMENTO = 1
const VOLUME_MINIMO_LITROS = 1250

const props = defineProps({
  empreendimento: { type: Object, required: true },
})

const calc = useCalculos(
  tanqueSepticoService,
  props.empreendimento.id,
  {
    id: null,
    contribuicaoDespejo: 'RESIDENCIA_PADRAO_MEDIO',
    taxaOcupacao: 4,
    numUnidades: null,
    faixaTemperatura: 'DE_10_A_20',
    intervaloLimpezaAnos: 1,
    formaTanque: 'PRISMATICO_RETANGULAR',
    profundidadeUtilM: null,
  },
  { max: MAX_POR_EMPREENDIMENTO },
)

// A Tabela 1 conta pessoas na maioria dos tipos, mas refeições em restaurante, lugares em
// cinema e bacias em sanitário público — é isso que entra como N na fórmula.
function unidade(item) {
  return UNIDADES_CONTRIBUICAO[item.unidadeContribuicao] ?? 'unidades'
}

function unidadeSingular(item) {
  return unidade(item).replace(/ões$/, 'ão').replace(/s$/, '')
}

function fmt(valor, casas = 2) {
  if (valor === null || valor === undefined) return '—'
  return Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })
}

onMounted(calc.carregar)
</script>
