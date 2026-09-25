// Rotas públicas do site de apresentação; o router do sistema só as inclui.
export const ROTAS_SITE = {
  path: '/apresentacao',
  component: () => import('@/site/components/SiteLayout.vue'),
  meta: { public: true, site: true },
  children: [
    {
      path: '',
      name: 'apresentacao',
      component: () => import('@/site/views/SiteInicioView.vue'),
    },
    {
      path: 'calculos',
      name: 'site-calculos',
      component: () => import('@/site/views/SiteCalculosView.vue'),
    },
    {
      path: 'assistente',
      name: 'site-assistente',
      component: () => import('@/site/views/SiteAssistenteView.vue'),
    },
    {
      path: 'recursos',
      name: 'site-recursos',
      component: () => import('@/site/views/SiteRecursosView.vue'),
    },
    {
      path: 'planos',
      name: 'site-planos',
      component: () => import('@/site/views/SitePlanosView.vue'),
    },
    {
      path: 'contato',
      name: 'site-contato',
      component: () => import('@/site/views/SiteContatoView.vue'),
    },
  ],
}

// Entre páginas, espera a transição site-pagina montar a nova antes de rolar.
export function rolagemSite(to, from, posicaoSalva) {
  const destino =
    posicaoSalva ?? (to.hash ? { el: to.hash, top: 88 } : { top: 0, behavior: 'instant' })
  const espera = to.path === from.path ? 0 : 200
  return new Promise((resolve) => setTimeout(() => resolve(destino), espera))
}
