// v-revelar: o elemento surge ao entrar na tela pela primeira vez.
// Só em elementos de classe estática: um :class reativo apagaria as classes postas aqui.
const observador =
  typeof IntersectionObserver === 'undefined'
    ? null
    : new IntersectionObserver(
        (entradas) => {
          for (const entrada of entradas) {
            if (!entrada.isIntersecting) continue
            entrada.target.classList.add('revelado')
            observador.unobserve(entrada.target)
          }
        },
        { rootMargin: '0px 0px -8% 0px' },
      )

export default {
  mounted(el) {
    if (!observador) return
    el.classList.add('revelar')
    observador.observe(el)
  },
  unmounted(el) {
    observador?.unobserve(el)
  },
}
