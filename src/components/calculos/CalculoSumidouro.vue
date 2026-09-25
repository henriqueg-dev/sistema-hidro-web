<template>
  <section class="card">
    <h2>Sumidouro</h2>
    <p class="subtitle">
      Infiltra no solo o efluente do tanque séptico. A área necessária vem da contribuição diária e
      da taxa de percolação do terreno (NBR 13969, Tabela A.1); fundo e parede lateral contam como
      área de infiltração.
    </p>

    <ListaCalculos :calc="calc" descricao-vazio="Cadastre o cálculo de sumidouro deste empreendimento.">
      <template #registro="{ item }">
        <div class="calculo-corpo">
          <div class="calculo-coluna">
            <div class="calculo-destaque">
              <span>Altura útil</span>
              <strong>{{ fmt(item.alturaUtilM, 2) }} m</strong>
              <small>
                {{ item.numSumidouros }} sumidouro(s) de D = {{ fmt(item.diametro, 2) }} m
              </small>
            </div>
          </div>

          <div class="calculo-secoes">
            <div class="calculo-secao">
              <h4>Dados usados</h4>
              <dl class="calculo-dados">
                <div>
                  <dt>Contribuição diária</dt>
                  <dd>
                    {{ fmt(item.contribuicaoDiariaLitros, 0) }} L/dia
                    <small>{{ fmt(item.contribuicaoM3Dia, 3) }} m³/dia</small>
                  </dd>
                </div>
                <div>
                  <dt>Taxa de percolação</dt>
                  <dd>
                    {{ fmt(item.taxaPercolacao, 0) }} min/m
                    <small>ensaio de percolação do terreno</small>
                  </dd>
                </div>
                <div>
                  <dt>Taxa de aplicação (Tx)</dt>
                  <dd>
                    {{ fmt(item.taxaAplicacao, 4) }} m³/m²·dia
                    <small>Tabela A.1, interpolada</small>
                  </dd>
                </div>
              </dl>
            </div>

            <div class="calculo-secao">
              <h4>Área de infiltração</h4>
              <dl class="calculo-dados">
                <div>
                  <dt>Área total (Cd / Tx)</dt>
                  <dd>{{ fmt(item.areaTotalM2, 2) }} m²</dd>
                </div>
                <div>
                  <dt>Por sumidouro</dt>
                  <dd>
                    {{ fmt(item.areaPorSumidouroM2, 2) }} m²
                    <small>fundo de {{ fmt(item.areaFundoM2, 2) }} m²</small>
                  </dd>
                </div>
                <div>
                  <dt>Área adotada</dt>
                  <dd>
                    {{ fmt(item.areaRealM2, 2) }} m²
                    <small>altura teórica de {{ fmt(item.alturaTeoricaM, 2) }} m</small>
                  </dd>
                </div>
                <div>
                  <dt>Volume útil</dt>
                  <dd>
                    {{ fmt(item.volumeUtilM3, 2) }} m³
                    <small>de cada sumidouro</small>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <p v-for="(alerta, indice) in item.alertas" :key="indice" class="msg aviso">
          {{ alerta }}
        </p>
        <p class="calculo-nota">
          Fundo a pelo menos 1,50 m do nível máximo do lençol freático; paredes de sumidouros
          vizinhos a pelo menos 1,50 m entre si.
        </p>
      </template>

      <template #form>
        <div class="field medio">
          <label for="sumidouroContribuicao">
            Contribuição diária (L/dia)&nbsp;<span
              class="dica"
              title="Esgoto que sai do tanque séptico por dia. Vem preenchida com a do cálculo de tanque séptico deste empreendimento, quando existe."
            >
              ?
            </span>
          </label>
          <input
            id="sumidouroContribuicao"
            v-model.number="calc.form.contribuicaoDiariaLitros"
            type="number"
            min="1"
            required
          />
        </div>

        <div class="field medio">
          <label for="sumidouroPercolacao">
            Taxa de percolação (min/m)&nbsp;<span
              class="dica"
              title="Resultado do ensaio de percolação do Anexo A da NBR 13969: tempo, em minutos, para a água baixar 1 m no furo. Acima de 2400 min/m o solo não comporta sumidouro."
            >
              ?
            </span>
          </label>
          <input
            id="sumidouroPercolacao"
            v-model.number="calc.form.taxaPercolacao"
            type="number"
            step="1"
            min="1"
            required
          />
        </div>

        <div class="field estreito">
          <label for="sumidouroDiametro">
            Diâmetro (m)&nbsp;<span
              class="dica"
              title="Diâmetro interno. A NBR 17076:2024 pede no mínimo 1,00 m."
            >
              ?
            </span>
          </label>
          <input
            id="sumidouroDiametro"
            v-model.number="calc.form.diametro"
            type="number"
            step="0.05"
            min="0.1"
            required
          />
        </div>

        <div class="field estreito">
          <label for="sumidouroQuantidade">Número de sumidouros</label>
          <input
            id="sumidouroQuantidade"
            v-model.number="calc.form.numSumidouros"
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
import * as sumidouroService from '@/services/sumidouroService'
import * as tanqueSepticoService from '@/services/tanqueSepticoService'

// Limite espelhado no backend (SumidouroService.MAX_POR_EMPREENDIMENTO).
const MAX_POR_EMPREENDIMENTO = 1

const props = defineProps({
  empreendimento: { type: Object, required: true },
})

const formVazio = {
  id: null,
  contribuicaoDiariaLitros: null,
  taxaPercolacao: null,
  diametro: 1,
  numSumidouros: 1,
}

const calc = useCalculos(sumidouroService, props.empreendimento.id, formVazio, {
  max: MAX_POR_EMPREENDIMENTO,
  nomeArquivo: 'sumidouro',
})

function fmt(valor, casas) {
  if (valor === null || valor === undefined) return '—'
  return Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })
}

onMounted(async () => {
  calc.carregar()
  // O formulário novo é copiado deste objeto ao abrir, então o valor chega a tempo.
  try {
    const [tanque] = await tanqueSepticoService.listarPorEmpreendimento(props.empreendimento.id)
    if (tanque) formVazio.contribuicaoDiariaLitros = tanque.contribuicaoDiariaLitros
  } catch {
    // Sem tanque séptico, a contribuição fica em branco para ser digitada.
  }
})
</script>
