<template>
  <header class="site-cabecalho" :class="{ rolado, aberto: menuAberto }">
    <div class="site-container site-cabecalho-conteudo">
      <RouterLink :to="{ name: 'apresentacao' }" class="brand">
        <img class="brand-icon" src="@/assets/hidros-icone-app.png" alt="" />
        Hidros
      </RouterLink>

      <!-- Ícone com as três barras do símbolo da marca. -->
      <button
        type="button"
        class="site-menu-botao"
        aria-controls="site-nav"
        :aria-expanded="menuAberto"
        :aria-label="menuAberto ? 'Fechar menu' : 'Abrir menu'"
        @click="menuAberto = !menuAberto"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav id="site-nav" class="site-nav" aria-label="Páginas do site">
        <RouterLink v-for="pagina in PAGINAS_SITE" :key="pagina.rota" :to="{ name: pagina.rota }">
          {{ pagina.nome }}
        </RouterLink>
        <SiteEntrar class="primario" />
      </nav>
    </div>
  </header>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import SiteEntrar from '@/site/components/SiteEntrar.vue'
import { PAGINAS_SITE } from '@/site/conteudo/paginas'

const route = useRoute()
const menuAberto = ref(false)
const rolado = ref(false)

watch(
  () => route.fullPath,
  () => (menuAberto.value = false),
)

function marcarRolagem() {
  rolado.value = window.scrollY > 8
}

onMounted(() => {
  marcarRolagem()
  window.addEventListener('scroll', marcarRolagem, { passive: true })
})

onUnmounted(() => window.removeEventListener('scroll', marcarRolagem))
</script>
