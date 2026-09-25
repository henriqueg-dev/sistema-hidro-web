// Canais de contato do site; o Instagram ainda será criado com este nome.
export const CONTATO = {
  whatsapp: { numero: '5537998584336', exibicao: '(37) 99858-4336' },
  email: 'henriquepg1011@gmail.com',
  instagram: { usuario: 'hidros', url: 'https://www.instagram.com/hidros' },
}

export const linkWhatsapp = (texto = '') =>
  `https://wa.me/${CONTATO.whatsapp.numero}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`

export const linkEmail = (assunto = '', corpo = '') =>
  `mailto:${CONTATO.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`

// Ícones em traço (viewBox 24×24): balão de conversa, envelope e câmera.
export const CANAIS = [
  {
    nome: 'WhatsApp',
    valor: CONTATO.whatsapp.exibicao,
    href: linkWhatsapp(),
    externo: true,
    icone: 'M21 11.5a8.4 8.4 0 0 1-12.3 7.5L3 21l2-5.6A8.4 8.4 0 1 1 21 11.5z',
  },
  {
    nome: 'E-mail',
    valor: CONTATO.email,
    href: `mailto:${CONTATO.email}`,
    icone: 'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM3 7l9 6 9-6',
  },
  {
    nome: 'Instagram',
    valor: `@${CONTATO.instagram.usuario}`,
    href: CONTATO.instagram.url,
    externo: true,
    icone:
      'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM17.5 6.5h.01',
  },
]
