<template>
  <div class="site">
    <SiteCabecalho />
    <main>
      <RouterView v-slot="{ Component }">
        <Transition name="site-pagina" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <SiteRodape />
  </div>
</template>

<script setup>
import '@/site/site.css'
import SiteCabecalho from '@/site/components/SiteCabecalho.vue'
import SiteRodape from '@/site/components/SiteRodape.vue'
</script>
