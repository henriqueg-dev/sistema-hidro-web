/** Iniciais para o ícone do card: "Construtora Alfa" vira "CA". */
export function iniciais(nome) {
  return String(nome ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palavra) => palavra[0].toUpperCase())
    .join('')
}
