/** Data e hora da API no formato brasileiro; sem valor, um traço. */
export function formatarDataHora(valor) {
  return valor ? new Date(valor).toLocaleString('pt-BR') : '—'
}

export function formatarReais(valor) {
  return Number(valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
