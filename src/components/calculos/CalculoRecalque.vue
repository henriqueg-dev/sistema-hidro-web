<template>
  <section class="card">
    <h2>Recalque</h2>
    <p class="subtitle">
      Bomba que leva a água do reservatório inferior ao superior. Vazão pelas horas de
      funcionamento, diâmetro de recalque pela fórmula de Forchheimer e sucção um diâmetro acima;
      perdas por Fair-Whipple-Hsiao (NBR 5626) e potência P = Q · Hman / 75η.
    </p>

    <ListaCalculos :calc="calc" descricao-vazio="Cadastre o cálculo de recalque deste empreendimento.">
      <template #registro="{ item }">
        <div class="calculo-corpo">
          <div class="calculo-coluna">
            <div class="calculo-destaque">
              <span>Motor sugerido</span>
              <strong>{{ item.motorComercialCv ? `${fmt(item.motorComercialCv, 2)} cv` : 'Catálogo' }}</strong>
              <small>
                {{ fmt(item.potenciaCv, 2) }} cv calculados + folga de {{ item.folgaPercentual }}%
              </small>
            </div>

            <div class="calculo-destaque">
              <span>Altura manométrica</span>
              <strong>{{ fmt(item.alturaManometricaM, 2) }} mca</strong>
              <small>vazão de {{ fmt(item.vazaoM3h, 2) }} m³/h</small>
            </div>
          </div>

          <div class="calculo-secoes">
            <div class="calculo-secao">
              <h4>Vazão e diâmetros</h4>
              <dl class="calculo-dados">
                <div>
                  <dt>Consumo diário</dt>
                  <dd>
                    {{ fmt(item.consumoDiarioLitros, 0) }} L
                    <small>{{ item.populacao }} hab × {{ item.consumoPerCapita }} L/hab·dia</small>
                  </dd>
                </div>
                <div>
                  <dt>Vazão de recalque</dt>
                  <dd>
                    {{ fmt(item.vazaoLs, 3) }} L/s
                    <small>{{ fmt(item.horasFuncionamento, 1) }} h de bomba por dia</small>
                  </dd>
                </div>
                <div>
                  <dt>Diâmetro teórico</dt>
                  <dd>
                    {{ fmt(item.diametroTeoricoMm, 1) }} mm
                    <small>fórmula de Forchheimer</small>
                  </dd>
                </div>
                <div>
                  <dt>Recalque</dt>
                  <dd>
                    DN {{ item.dnRecalqueMm }} mm
                    <small>água a {{ fmt(item.velocidadeRecalqueMs, 2) }} m/s</small>
                  </dd>
                </div>
                <div>
                  <dt>Sucção</dt>
                  <dd>
                    DN {{ item.dnSuccaoMm }} mm
                    <small>água a {{ fmt(item.velocidadeSuccaoMs, 2) }} m/s</small>
                  </dd>
                </div>
              </dl>
            </div>

            <div class="calculo-secao">
              <h4>Altura manométrica</h4>
              <dl class="calculo-dados">
                <div>
                  <dt>Desníveis</dt>
                  <dd>
                    {{ fmt(item.desnivelSuccao + item.desnivelRecalque, 2) }} m
                    <small>
                      sucção {{ fmt(item.desnivelSuccao, 2) }} + recalque
                      {{ fmt(item.desnivelRecalque, 2) }}
                    </small>
                  </dd>
                </div>
                <div>
                  <dt>Perda na sucção</dt>
                  <dd>
                    {{ fmt(item.perdaCargaSuccaoM, 3) }} m
                    <small>
                      {{ fmt(item.comprimentoSuccao, 1) }} m de tubo +
                      {{ fmt(item.comprimentoEquivalenteSuccaoM, 1) }} m em conexões
                    </small>
                  </dd>
                </div>
                <div>
                  <dt>Perda no recalque</dt>
                  <dd>
                    {{ fmt(item.perdaCargaRecalqueM, 3) }} m
                    <small>
                      {{ fmt(item.comprimentoRecalque, 1) }} m de tubo +
                      {{ fmt(item.comprimentoEquivalenteRecalqueM, 1) }} m em conexões
                    </small>
                  </dd>
                </div>
                <div>
                  <dt>Carga de velocidade</dt>
                  <dd>
                    {{ fmt(item.cargaVelocidadeM, 3) }} m
                    <small>V²/2g na saída do recalque</small>
                  </dd>
                </div>
              </dl>
            </div>

            <div class="calculo-secao">
              <h4>Potência</h4>
              <dl class="calculo-dados">
                <div>
                  <dt>Potência calculada</dt>
                  <dd>
                    {{ fmt(item.potenciaCv, 2) }} cv
                    <small>{{ fmt(item.potenciaKw, 2) }} kW com η = {{ item.rendimentoPercentual }}%</small>
                  </dd>
                </div>
                <div>
                  <dt>Com folga de projeto</dt>
                  <dd>
                    {{ fmt(item.potenciaComFolgaCv, 2) }} cv
                    <small>+{{ item.folgaPercentual }}%, prática de projeto</small>
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
          <label for="recalqueTaxaOcupacao">Habitantes por unidade</label>
          <input
            id="recalqueTaxaOcupacao"
            v-model.number="calc.form.taxaOcupacao"
            type="number"
            min="1"
            required
          />
        </div>

        <div class="field estreito">
          <label for="recalqueNumUnidades">Número de unidades</label>
          <input
            id="recalqueNumUnidades"
            v-model.number="calc.form.numUnidades"
            type="number"
            min="1"
            required
          />
        </div>

        <div class="field">
          <label for="recalqueConsumo">Consumo per capita (L/hab·dia)</label>
          <input
            id="recalqueConsumo"
            v-model.number="calc.form.consumoPerCapita"
            type="number"
            min="1"
            required
          />
        </div>

        <div class="field medio">
          <label for="recalqueHoras">
            Funcionamento (h/dia)&nbsp;<span
              class="dica"
              title="Horas por dia em que a bomba enche o reservatório superior. Até 6,67 h a vazão cobre 15% do consumo diário por hora; costuma-se usar 4 h em escritórios, 5 h em apartamentos e 6 h em hotéis e hospitais."
            >
              ?
            </span>
          </label>
          <input
            id="recalqueHoras"
            v-model.number="calc.form.horasFuncionamento"
            type="number"
            step="0.5"
            min="0.5"
            max="24"
            required
          />
        </div>

        <div class="field estreito">
          <label for="recalqueRendimento">
            Rendimento η (%)&nbsp;<span
              class="dica"
              title="Rendimento do conjunto motobomba, da curva do fabricante. Usuais: 40 a 60% até 2 cv, 70 a 75% de 2 a 5 cv, 80% acima."
            >
              ?
            </span>
          </label>
          <input
            id="recalqueRendimento"
            v-model.number="calc.form.rendimentoPercentual"
            type="number"
            min="1"
            max="100"
            required
          />
        </div>

        <div v-for="trecho in TRECHOS" :key="trecho.chave" class="inteiro trecho-editor">
          <div class="trecho-cabecalho">
            <span class="badge">{{ trecho.rotulo }}</span>
            <span class="subtitle">{{ trecho.descricao }}</span>
          </div>

          <div class="form-linha">
            <div class="field medio">
              <label :for="`desnivel${trecho.chave}`">
                Desnível (m)&nbsp;<span class="dica" :title="trecho.dicaDesnivel">?</span>
              </label>
              <input
                :id="`desnivel${trecho.chave}`"
                v-model.number="calc.form[`desnivel${trecho.chave}`]"
                type="number"
                step="0.01"
                required
              />
            </div>

            <div class="field medio">
              <label :for="`comprimento${trecho.chave}`">Comprimento de tubo (m)</label>
              <input
                :id="`comprimento${trecho.chave}`"
                v-model.number="calc.form[`comprimento${trecho.chave}`]"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div class="conexoes">
            <div
              v-for="(conexao, indice) in calc.form[`conexoes${trecho.chave}`]"
              :key="indice"
              class="form-linha conexao-linha"
            >
              <div class="field amplo">
                <label :for="`conexao${trecho.chave}${indice}`">Conexão</label>
                <select :id="`conexao${trecho.chave}${indice}`" v-model="conexao.tipo">
                  <option v-for="opcao in conexoesDisponiveis" :key="opcao" :value="opcao">
                    {{ opcao }}
                  </option>
                </select>
              </div>
              <div class="field estreito">
                <label :for="`quantidade${trecho.chave}${indice}`">Qtd.</label>
                <input
                  :id="`quantidade${trecho.chave}${indice}`"
                  v-model.number="conexao.quantidade"
                  type="number"
                  min="1"
                  required
                />
              </div>
              <div class="field actions">
                <button
                  type="button"
                  class="btn-link perigo"
                  @click="calc.form[`conexoes${trecho.chave}`].splice(indice, 1)"
                >
                  Remover
                </button>
              </div>
            </div>

            <div class="conexoes-rodape">
              <button
                type="button"
                class="btn-secundario"
                @click="calc.form[`conexoes${trecho.chave}`].push({ tipo: 'Joelho 90°', quantidade: 1 })"
              >
                Adicionar conexão
              </button>
              <span class="subtitle">
                O comprimento equivalente é somado no diâmetro que o cálculo adotar.
              </span>
            </div>
          </div>
        </div>
      </template>
    </ListaCalculos>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import ListaCalculos from '@/components/calculos/ListaCalculos.vue'
import { useCalculos } from '@/composables/useCalculos'
import * as recalqueService from '@/services/recalqueService'
import * as piscinaService from '@/services/piscinaService'

// Limite espelhado no backend (RecalqueService.MAX_POR_EMPREENDIMENTO).
const MAX_POR_EMPREENDIMENTO = 1

const TRECHOS = [
  {
    chave: 'Succao',
    rotulo: 'Sucção',
    descricao: 'do reservatório inferior até a bomba',
    dicaDesnivel:
      'Do nível mínimo da água no reservatório inferior até o eixo da bomba. Negativo quando a bomba fica abaixo do nível (sucção afogada).',
  },
  {
    chave: 'Recalque',
    rotulo: 'Recalque',
    descricao: 'da bomba até a entrada do reservatório superior',
    dicaDesnivel: 'Do eixo da bomba até o ponto de descarga no reservatório superior.',
  },
]

const props = defineProps({
  empreendimento: { type: Object, required: true },
})

// Montagem típica: válvula de pé na sucção; retenção e registro logo após a bomba.
const calc = useCalculos(
  recalqueService,
  props.empreendimento.id,
  {
    id: null,
    taxaOcupacao: props.empreendimento.taxaOcupacao ?? 4,
    numUnidades: props.empreendimento.numUnidades,
    consumoPerCapita: props.empreendimento.consumoPerCapita ?? 150,
    horasFuncionamento: 5,
    rendimentoPercentual: 50,
    desnivelSuccao: null,
    comprimentoSuccao: null,
    conexoesSuccao: [
      { tipo: 'Válvula de pé e crivo', quantidade: 1 },
      { tipo: 'Joelho 90°', quantidade: 1 },
      { tipo: 'Registro gaveta aberto', quantidade: 1 },
    ],
    desnivelRecalque: null,
    comprimentoRecalque: null,
    conexoesRecalque: [
      { tipo: 'Válvula de retenção vertical', quantidade: 1 },
      { tipo: 'Registro gaveta aberto', quantidade: 1 },
      { tipo: 'Joelho 90°', quantidade: 2 },
      { tipo: 'Saída de canal', quantidade: 1 },
    ],
  },
  { max: MAX_POR_EMPREENDIMENTO, nomeArquivo: 'recalque' },
)

// Rótulos das conexões: a API aceita e devolve o rótulo, então o select trabalha com ele.
const conexoesDisponiveis = ref([])

function fmt(valor, casas) {
  if (valor === null || valor === undefined) return '—'
  return Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })
}

onMounted(async () => {
  calc.carregar()
  try {
    const referencias = await piscinaService.referencias()
    conexoesDisponiveis.value = referencias.conexoes.map((conexao) => conexao.descricao)
  } catch {
    calc.erro = 'Não foi possível carregar a lista de conexões.'
  }
})
</script>
