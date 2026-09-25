<template>
  <div>
    <section class="site-topo site-planta">
      <div class="site-container">
        <h1>Tenho interesse</h1>
        <p>
          Quer usar o Hidros no seu escritório? Deixe seus dados e a gente cria o acesso e combina o
          plano com você.
        </p>
      </div>
    </section>

    <section class="site-secao">
      <div class="site-container site-dupla">
        <div class="site-dupla-texto" v-revelar>
          <h2>Fale com a gente</h2>
          <p>
            Preencha o formulário e escolha por onde enviar, ou chame direto por um dos canais
            abaixo.
          </p>

          <ul class="site-contatos">
            <li v-for="canal in CANAIS" :key="canal.nome">
              <a :href="canal.href" v-bind="canal.externo && { target: '_blank', rel: 'noopener' }">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="canal.icone" /></svg>
                <span>
                  <small>{{ canal.nome }}</small>
                  {{ canal.valor }}
                </span>
              </a>
            </li>
          </ul>
        </div>

        <form class="card site-interesse" v-revelar @submit.prevent="enviar">
          <div class="field">
            <label for="interesse-nome">Nome</label>
            <input id="interesse-nome" v-model.trim="form.nome" required autocomplete="name" />
          </div>
          <div class="field">
            <label for="interesse-email">E-mail</label>
            <input
              id="interesse-email"
              v-model.trim="form.email"
              type="email"
              required
              autocomplete="email"
            />
          </div>
          <div class="field">
            <label for="interesse-telefone">Telefone</label>
            <input
              id="interesse-telefone"
              v-model.trim="form.telefone"
              type="tel"
              autocomplete="tel"
            />
          </div>
          <div class="field">
            <label for="interesse-escritorio">Escritório ou empresa</label>
            <input
              id="interesse-escritorio"
              v-model.trim="form.escritorio"
              autocomplete="organization"
            />
          </div>
          <div class="field">
            <label for="interesse-mensagem">Mensagem</label>
            <textarea id="interesse-mensagem" v-model.trim="form.mensagem" rows="4"></textarea>
          </div>

          <div class="site-acoes">
            <button type="submit" value="whatsapp" class="site-botao primario">
              Enviar pelo WhatsApp
            </button>
            <button type="submit" value="email" class="site-botao">Enviar por e-mail</button>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import vRevelar from '@/site/diretivas/revelar'
import { CANAIS, linkEmail, linkWhatsapp } from '@/site/conteudo/contato'

const form = reactive({ nome: '', email: '', telefone: '', escritorio: '', mensagem: '' })

// Sem backend de leads: o formulário só monta a mensagem e abre o canal escolhido.
function enviar(evento) {
  const texto = [
    'Olá! Tenho interesse no Hidros.',
    `Nome: ${form.nome}`,
    `E-mail: ${form.email}`,
    form.telefone && `Telefone: ${form.telefone}`,
    form.escritorio && `Escritório: ${form.escritorio}`,
    form.mensagem,
  ]
    .filter(Boolean)
    .join('\n')

  if (evento.submitter?.value === 'email') {
    window.location.href = linkEmail('Interesse no Hidros', texto)
  } else {
    window.open(linkWhatsapp(texto), '_blank', 'noopener')
  }
}
</script>
