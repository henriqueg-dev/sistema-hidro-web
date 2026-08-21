<template>
  <section class="card">
    <h2>Caixa de gordura e sabão</h2>
    <p class="subtitle">
      Volume calculado pela população atendida (taxa de ocupação &times; número de apartamentos). Até
      {{ MAX_POR_EMPREENDIMENTO }} cálculos por empreendimento.
    </p>

    <ListaCalculos
      :calc="calc"
      descricao-vazio="Cadastre o primeiro cálculo de caixa de gordura e sabão deste empreendimento."
      descricao-adicionar="Registre o segundo cálculo deste empreendimento."
    >
      <template #registro="{ item }">
        <div class="calculo-corpo">
          <div class="calculo-destaque">
            <span>Volume da caixa (Vc)</span>
            <strong>{{ item.volumeLitros }} L</strong>
            <small>{{ item.formula }}</small>
          </div>

          <dl class="calculo-dados">
            <div>
              <dt>Taxa de ocupação</dt>
              <dd>{{ item.taxaOcupacao }} hab/apto</dd>
            </div>
            <div>
              <dt>Apartamentos</dt>
              <dd>{{ item.numApartamentos }}</dd>
            </div>
            <div>
              <dt>População (N)</dt>
              <dd>{{ item.populacao }} hab</dd>
            </div>
          </dl>
        </div>
      </template>

      <template #form>
        <div class="field estreito">
          <label for="taxaOcupacao">Taxa de ocupação (hab/apto)</label>
          <input id="taxaOcupacao" v-model.number="calc.form.taxaOcupacao" type="number" min="1" />
        </div>

        <div class="field estreito">
          <label for="numApartamentos">Número de apartamentos</label>
          <input
            id="numApartamentos"
            v-model.number="calc.form.numApartamentos"
            type="number"
            min="1"
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
import * as caixaGorduraService from '@/services/caixaGorduraService'

// Limite espelhado no backend (CaixaGorduraService.MAX_POR_EMPREENDIMENTO).
const MAX_POR_EMPREENDIMENTO = 2

const props = defineProps({
  empreendimento: { type: Object, required: true },
})

const calc = useCalculos(
  caixaGorduraService,
  props.empreendimento.id,
  { id: null, taxaOcupacao: 4, numApartamentos: null },
  { max: MAX_POR_EMPREENDIMENTO },
)

onMounted(calc.carregar)
</script>
