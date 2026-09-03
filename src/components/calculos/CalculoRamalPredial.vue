<template>
  <section class="card">
    <h2>Ramal predial e hidrômetro</h2>
    <p class="subtitle">
      Dimensiona o alimentador predial, que vai do hidrômetro até o reservatório inferior, e
      sugere o medidor. A vazão vem do tempo em que o reservatório precisa ser reposto.
    </p>

    <ListaCalculos
      :calc="calc"
      descricao-vazio="Cadastre o cálculo de ramal predial deste empreendimento."
    >
      <template #registro="{ item }">
        <div class="calculo-corpo">
          <div class="calculo-coluna">
            <div class="calculo-destaque">
              <span>Alimentador predial</span>
              <strong>DN {{ item.dnAdotadoMm }} mm</strong>
              <small>água a {{ fmt(item.velocidadeMs, 2) }} m/s</small>
            </div>

            <div class="calculo-destaque">
              <span>Hidrômetro sugerido</span>
              <strong>{{ fmt(item.hidrometroVazaoNominalM3h, 2) }} m³/h</strong>
              <small>suporta até {{ fmt(item.hidrometroVazaoMaximaM3h, 2) }} m³/h</small>
            </div>

            <div class="calculo-geometria">
              <h5>Consumo previsto</h5>
              <dl>
                <div>
                  <dt>Consumo mensal estimado</dt>
                  <dd>
                    {{ fmt(item.consumoMensalM3, 1) }} m³/mês
                    <small>confira na tabela da concessionária</small>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div class="calculo-secoes">
            <div class="calculo-secao">
              <h4>Dados usados</h4>
              <dl class="calculo-dados">
                <div>
                  <dt>População atendida</dt>
                  <dd>{{ item.populacao }} hab</dd>
                </div>
                <div>
                  <dt>Consumo per capita</dt>
                  <dd>{{ item.consumoPerCapita }} L/hab·dia</dd>
                </div>
                <div>
                  <dt>Consumo diário</dt>
                  <dd>{{ fmt(item.consumoDiarioM3, 3) }} m³</dd>
                </div>
                <div>
                  <dt>Tempo de reposição</dt>
                  <dd>
                    {{ item.tempoReposicaoH }} h
                    <small>máximo da norma: {{ item.tempoReposicaoMaximoH }} h</small>
                  </dd>
                </div>
              </dl>
            </div>

            <div class="calculo-secao">
              <h4>Resultado do dimensionamento</h4>
              <dl class="calculo-dados">
                <div>
                  <dt>Vazão de projeto</dt>
                  <dd>
                    {{ fmt(item.vazaoProjetoM3h, 3) }} m³/h
                    <small>{{ fmt(item.vazaoProjetoLs, 4) }} L/s</small>
                  </dd>
                </div>
                <div>
                  <dt>Diâmetro teórico</dt>
                  <dd>
                    {{ fmt(item.diametroTeoricoMm, 2) }} mm
                    <small>antes de arredondar para o comercial</small>
                  </dd>
                </div>
                <div>
                  <dt>Diâmetro adotado</dt>
                  <dd>
                    DN {{ item.dnAdotadoMm }} mm
                    <small>interno {{ fmt(item.diametroInternoMm, 1) }} mm</small>
                  </dd>
                </div>
                <div>
                  <dt>Velocidade resultante</dt>
                  <dd>
                    {{ fmt(item.velocidadeMs, 3) }} m/s
                    <small>limite adotado: {{ fmt(item.velocidadeMaximaMs, 1) }} m/s</small>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <p v-for="(alerta, indice) in item.alertas" :key="indice" class="msg aviso">
          {{ alerta }}
        </p>
      </template>

      <template #form>
        <div class="field estreito">
          <label for="ramalTaxaOcupacao">Habitantes por unidade</label>
          <input
            id="ramalTaxaOcupacao"
            v-model.number="calc.form.taxaOcupacao"
            type="number"
            min="1"
            required
          />
        </div>

        <div class="field estreito">
          <label for="ramalNumUnidades">Número de unidades</label>
          <input
            id="ramalNumUnidades"
            v-model.number="calc.form.numUnidades"
            type="number"
            min="1"
            required
          />
        </div>

        <div class="field">
          <label for="ramalConsumoPerCapita">Consumo per capita (L/hab·dia)</label>
          <input
            id="ramalConsumoPerCapita"
            v-model.number="calc.form.consumoPerCapita"
            type="number"
            min="1"
            required
          />
        </div>

        <div class="field medio">
          <label for="ramalTempoReposicao">
            Tempo de reposição (h)&nbsp;<span
              class="dica"
              title="Em quantas horas o reservatório precisa ser reposto. Em branco, adota o máximo da norma: 3 h em casa, 6 h nos demais."
            >
              ?
            </span>
          </label>
          <input
            id="ramalTempoReposicao"
            v-model.number="calc.form.tempoReposicaoH"
            type="number"
            min="1"
            max="6"
            placeholder="Máximo da norma"
          />
        </div>

        <div class="field medio">
          <label for="ramalVelocidade">
            Velocidade máxima (m/s)&nbsp;<span
              class="dica"
              title="Em branco, adota 3 m/s. Concessionárias costumam pedir de 0,6 a 1,0 m/s no alimentador."
            >
              ?
            </span>
          </label>
          <input
            id="ramalVelocidade"
            v-model.number="calc.form.velocidadeMaximaMs"
            type="number"
            step="0.1"
            min="0.1"
            placeholder="3,0"
          />
        </div>

        <div class="field medio">
          <label for="ramalHidrometro">
            Fixar hidrômetro&nbsp;<span
              class="dica"
              title="Em branco, sugere o menor medidor que cobre a vazão de projeto. Preencha para adotar o que a concessionária exigir."
            >
              ?
            </span>
          </label>
          <select id="ramalHidrometro" v-model="calc.form.hidrometroInformado">
            <option :value="null">Sugerido pelo cálculo</option>
            <option v-for="(rotulo, valor) in HIDROMETROS" :key="valor" :value="valor">
              {{ rotulo }}
            </option>
          </select>
        </div>
      </template>
    </ListaCalculos>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import ListaCalculos from '@/components/calculos/ListaCalculos.vue'
import { useCalculos } from '@/composables/useCalculos'
import * as ramalPredialService from '@/services/ramalPredialService'
import { HIDROMETROS } from '@/constants/opcoes'

// Limite espelhado no backend (RamalPredialService.MAX_POR_EMPREENDIMENTO).
const MAX_POR_EMPREENDIMENTO = 1

const props = defineProps({
  empreendimento: { type: Object, required: true },
})

const calc = useCalculos(
  ramalPredialService,
  props.empreendimento.id,
  {
    id: null,
    taxaOcupacao: 4,
    numUnidades: null,
    consumoPerCapita: 150,
    tempoReposicaoH: null,
    velocidadeMaximaMs: null,
    hidrometroInformado: null,
  },
  { max: MAX_POR_EMPREENDIMENTO, nomeArquivo: 'ramal-predial' },
)

function fmt(valor, casas) {
  if (valor === null || valor === undefined) return '—'
  return Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })
}

onMounted(calc.carregar)
</script>
