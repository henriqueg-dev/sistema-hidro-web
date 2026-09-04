import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/clientes',
      name: 'clientes',
      component: () => import('@/views/ClientesView.vue'),
    },
    {
      path: '/clientes/:id',
      name: 'cliente-detalhe',
      component: () => import('@/views/ClienteDetalheView.vue'),
      props: true,
    },
    {
      path: '/empreendimentos/:id',
      name: 'empreendimento-detalhe',
      component: () => import('@/views/EmpreendimentoDetalheView.vue'),
      props: true,
    },
    {
      path: '/empreendimentos/:id/piscinas',
      name: 'piscinas',
      component: () => import('@/views/PiscinasView.vue'),
      props: true,
    },
    {
      path: '/assistente',
      name: 'assistente',
      component: () => import('@/assistente/views/AssistenteView.vue'),
    },
    {
      path: '/prumadas',
      name: 'prumadas',
      component: () => import('@/views/PrumadasView.vue'),
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: () => import('@/views/UsuariosView.vue'),
    },
    {
      path: '/orcamentos',
      name: 'orcamentos',
      component: () => import('@/views/OrcamentosView.vue'),
      meta: { requiresAdmin: true },
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (!to.meta.public && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.name === 'login' && authStore.isAuthenticated) {
    return { name: 'home' }
  }

  if (to.meta.requiresAdmin && authStore.perfil !== 'ADMIN') {
    return { name: 'home' }
  }
})

export default router
