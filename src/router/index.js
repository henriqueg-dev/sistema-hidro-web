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
      path: '/empresas',
      name: 'empresas',
      component: () => import('@/views/EmpresasView.vue'),
    },
    {
      path: '/empresas/:id',
      name: 'empresa-detalhe',
      component: () => import('@/views/EmpresaDetalheView.vue'),
      props: true,
    },
    {
      path: '/empreendimentos/:id',
      name: 'empreendimento-detalhe',
      component: () => import('@/views/EmpreendimentoDetalheView.vue'),
      props: true,
    },
    {
      path: '/assistente',
      name: 'assistente',
      component: () => import('@/views/AssistenteView.vue'),
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
