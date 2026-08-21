<template>
  <p v-if="calc.carregando" class="subtitle">Carregando cálculos...</p>

  <div v-else-if="calc.itens.length" class="lista-calculos">
    <article
      v-for="(item, indice) in calc.itens"
      :key="item.id"
      class="calculo-registro"
      :class="{ 'em-edicao': calc.form.id === item.id }"
    >
      <header>
        <span class="badge">Cálculo {{ indice + 1 }}</span>

        <span v-if="calc.paraRemover === item.id" class="confirmacao">
          <span>Remover este cálculo?</span>
          <button
            type="button"
            class="btn-link perigo"
            :disabled="calc.removendo"
            @click="calc.remover(item)"
          >
            {{ calc.removendo ? 'Removendo...' : 'Sim, remover' }}
          </button>
          <button type="button" class="btn-link" @click="calc.cancelarRemocao()">Cancelar</button>
        </span>

        <span v-else class="confirmacao">
          <button type="button" class="btn-link" @click="calc.editar(item)">Alterar</button>
          <button type="button" class="btn-link perigo" @click="calc.confirmarRemocao(item)">
            Remover
          </button>
        </span>
      </header>

      <slot name="registro" :item="item" />
    </article>

    <button
      v-if="!calc.formAberto && calc.podeAdicionar"
      type="button"
      class="calculo-adicionar"
      @click="calc.novo()"
    >
      <strong>+ Novo cálculo</strong>
      <span>{{ descricaoAdicionar }}</span>
    </button>
  </div>

  <div v-else-if="!calc.formAberto" class="estado-vazio">
    <strong>Nenhum cálculo registrado</strong>
    <span>{{ descricaoVazio }}</span>
    <button type="button" @click="calc.novo()">Novo cálculo</button>
  </div>

  <div v-if="calc.formAberto" class="form-destaque">
    <h3>{{ calc.tituloForm }}</h3>

    <form class="form-linha" @submit.prevent="calc.salvar()">
      <slot name="form" />

      <div class="field actions">
        <button type="submit" :disabled="calc.salvando">
          {{ calc.salvando ? 'Calculando...' : 'Calcular' }}
        </button>
        <button type="button" class="btn-secundario" @click="calc.cancelar()">Cancelar</button>
      </div>
    </form>
  </div>

  <p v-if="calc.erro" class="msg erro">{{ calc.erro }}</p>
</template>

<script setup>
defineProps({
  calc: { type: Object, required: true },
  descricaoVazio: { type: String, required: true },
  // Sem uso quando o cálculo aceita um único registro por empreendimento.
  descricaoAdicionar: { type: String, default: '' },
})
</script>
