import api from '@/services/api'

/** CRUD e memorial em PDF de um cálculo registrado no empreendimento, sob `/api/<recurso>`. */
export function criarServicoCalculo(recurso) {
  const base = `/api/${recurso}`

  return {
    criar: (dados) => api.post(base, dados).then((response) => response.data),
    atualizar: (id, dados) => api.put(`${base}/${id}`, dados).then((response) => response.data),
    excluir: (id) => api.delete(`${base}/${id}`).then((response) => response.data),
    listarPorEmpreendimento: (empreendimentoId) =>
      api.get(`${base}/empreendimento/${empreendimentoId}`).then((response) => response.data),
    baixarMemorialPdf: (id) =>
      api
        .get(`${base}/${id}/memorial.pdf`, { responseType: 'blob' })
        .then((response) => response.data),
  }
}
