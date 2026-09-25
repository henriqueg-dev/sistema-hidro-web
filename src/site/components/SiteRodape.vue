<template>
  <footer class="site-rodape">
    <div class="site-container">
      <div class="site-rodape-chamada">
        <div>
          <h2>Seu próximo memorial pode sair hoje.</h2>
          <p>Cadastre o empreendimento, rode os cálculos e baixe o PDF.</p>
        </div>
        <div class="site-acoes">
          <RouterLink :to="{ name: 'site-contato' }" class="site-botao claro"
            >Tenho interesse</RouterLink
          >
          <SiteEntrar class="contorno" />
        </div>
      </div>

      <div class="site-rodape-colunas">
        <div class="site-rodape-marca">
          <img src="@/assets/hidros-negativo.png" alt="Hidros — Cálculos hidráulicos" />
          <p>
            Cálculos hidráulicos prediais com precisão normativa, do jeito que o seu escritório
            precisa.
          </p>
        </div>

        <nav aria-label="Páginas do site">
          <h3>Site</h3>
          <RouterLink v-for="pagina in PAGINAS_SITE" :key="pagina.rota" :to="{ name: pagina.rota }">
            {{ pagina.nome }}
          </RouterLink>
        </nav>

        <nav aria-label="Contato">
          <h3>Contato</h3>
          <div class="site-rodape-redes">
            <a
              v-for="canal in CANAIS"
              :key="canal.nome"
              :href="canal.href"
              :aria-label="`${canal.nome}: ${canal.valor}`"
              :title="canal.valor"
              v-bind="canal.externo && { target: '_blank', rel: 'noopener' }"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="canal.icone" /></svg>
            </a>
          </div>
        </nav>
      </div>

      <div class="site-rodape-base">
        <span>© {{ ano }} Hidros</span>
        <span>
          Os memoriais apoiam o responsável técnico do projeto e não substituem a validação dele.
        </span>
      </div>
    </div>
  </footer>
</template>

<script setup>
import SiteEntrar from '@/site/components/SiteEntrar.vue'
import { PAGINAS_SITE } from '@/site/conteudo/paginas'
import { CANAIS } from '@/site/conteudo/contato'

const ano = new Date().getFullYear()
</script>
