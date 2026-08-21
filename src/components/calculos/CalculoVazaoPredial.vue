<template>
  <section class="card">
    <h2>Vazão predial</h2>
    <p class="subtitle">
      Demanda a partir da população (taxa de ocupação &times; apartamentos) e do consumo per capita.
      Coeficientes fixos: K1 = 1,2 (dia de maior consumo) e K2 = 1,5 (hora de maior consumo).
    </p>

    <ListaCalculos
      :calc="calc"
      descricao-vazio="Cadastre o cálculo de vazão predial deste empreendimento."
    >
      <template #registro="{ item }">
        <div class="calculo-secoes">
          <div class="calculo-secao">
            <h4>Parâmetros adotados</h4>
            <dl class="calculo-dados">
              <div>
                <dt>Taxa de ocupação</dt>
                <dd>{{ item.taxaOcupacao }} hab/apto</dd>
              </div>
              <div>
                <dt>Número de apartamentos</dt>
                <dd>{{ item.numApartamentos }}</dd>
              </div>
              <div>
                <dt>Q = consumo per capita</dt>
                <dd>{{ item.consumoPerCapita }} L/hab·dia</dd>
              </div>
              <div>
                <dt>Capacidade equivalente</dt>
                <dd>{{ item.capacidadeEquivalenteDias }} dia(s)</dd>
              </div>
            </dl>
          </div>

          <div class="calculo-secao">
            <h4>Volume caixa d'água</h4>
            <dl class="calculo-dados">
              <div>
                <dt>Vc = Q &times; Tx. Ocup. &times; Nº Aparta &times; Cap. Equiv.</dt>
                <dd>{{ fmt(item.volumeCaixaM3, 2) }} m³</dd>
              </div>
            </dl>
          </div>

          <div class="calculo-secao">
            <h4>Coeficiente de variação de demanda</h4>
            <dl class="calculo-dados">
              <div>
                <dt>K1 — dia de maior consumo</dt>
                <dd>{{ fmt(item.k1, 1) }}</dd>
              </div>
              <div>
                <dt>K2 — hora de maior consumo</dt>
                <dd>{{ fmt(item.k2, 1) }}</dd>
              </div>
            </dl>
          </div>

          <div class="calculo-secao">
            <h4>Cálculo de vazão total</h4>
            <dl class="calculo-dados">
              <div>
                <dt>P = hab &times; nº aptos</dt>
                <dd>{{ item.populacao }} pessoas</dd>
              </div>
            </dl>
          </div>

          <div class="calculo-secao">
            <h4>Cálculo de demanda diária</h4>
            <dl class="calculo-dados">
              <div>
                <dt>Qm = P &times; Q / 86400</dt>
                <dd>{{ fmt(item.vazaoMediaLps, 9, 0) }} L/s</dd>
              </div>
            </dl>
          </div>

          <div class="calculo-secao">
            <h4>Cálculo de demanda máxima diária</h4>
            <dl class="calculo-dados">
              <div>
                <dt>Qmáx = Qm &times; K1</dt>
                <dd>{{ fmt(item.vazaoMaximaDiariaLps, 9, 0) }} L/s</dd>
              </div>
            </dl>
          </div>

          <div class="calculo-secao">
            <h4>Cálculo de demanda máxima hora</h4>
            <dl class="calculo-dados">
              <div>
                <dt>Qmáx/h = Qmáx &times; K2</dt>
                <dd>{{ fmt(item.vazaoMaximaHoraLps, 9, 0) }} L/s</dd>
              </div>
            </dl>

            <div class="calculo-corpo">
              <div class="calculo-destaque">
                <span>Qmáx/h</span>
                <strong>{{ fmt(item.vazaoMaximaHoraM3h, 2) }} m³/h</strong>
              </div>
              <div class="calculo-destaque">
                <span>Qmáx/h</span>
                <strong>{{ fmt(item.vazaoMaximaHoraM3mes, 2) }} m³/mês</strong>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #form>
        <div class="field estreito">
          <label for="vazaoTaxaOcupacao">Taxa de ocupação (hab/apto)</label>
          <input
            id="vazaoTaxaOcupacao"
            v-model.number="calc.form.taxaOcupacao"
            type="number"
            min="1"
            required
          />
        </div>

        <div class="field estreito">
          <label for="vazaoNumApartamentos">Número de apartamentos</label>
          <input
            id="vazaoNumApartamentos"
            v-model.number="calc.form.numApartamentos"
            type="number"
            min="1"
            required
          />
        </div>

        <div class="field estreito">
          <label for="vazaoConsumoPerCapita">Consumo per capita (L/hab·dia)</label>
          <input
            id="vazaoConsumoPerCapita"
            v-model.number="calc.form.consumoPerCapita"
            type="number"
            min="1"
            required
          />
        </div>

        <div class="field estreito">
          <label for="vazaoCapacidade">Capacidade equivalente (dias)</label>
          <input
            id="vazaoCapacidade"
            v-model.number="calc.form.capacidadeEquivalenteDias"
            type="number"
            min="1"
            required
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
import * as vazaoPredialService from '@/services/vazaoPredialService'

// Limite espelhado no backend (VazaoPredialService.MAX_POR_EMPREENDIMENTO).
const MAX_POR_EMPREENDIMENTO = 1

const props = defineProps({
  empreendimento: { type: Object, required: true },
})

const calc = useCalculos(
  vazaoPredialService,
  props.empreendimento.id,
  {
    id: null,
    taxaOcupacao: 4,
    numApartamentos: null,
    consumoPerCapita: 150,
    capacidadeEquivalenteDias: 1,
  },
  { max: MAX_POR_EMPREENDIMENTO },
)

function fmt(valor, casas, minimo = casas) {
  return Number(valor ?? 0).toLocaleString('pt-BR', {
    minimumFractionDigits: minimo,
    maximumFractionDigits: casas,
  })
}

onMounted(calc.carregar)
</script>
