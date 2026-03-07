function Field({ label, value }) {
  return (
    <div className="detail-field">
      <span>{label}</span>
      <strong>{value || "-"}</strong>
    </div>
  );
}

export default function AdminCredenciadoDetails({ credenciado, eventos, onClose }) {
  if (!credenciado) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <section className="card modal-card">
        <div className="modal-header">
          <h3>Detalhes do Credenciado</h3>
          <button type="button" onClick={onClose}>
            Fechar
          </button>
        </div>

        <div className="details-grid">
          <Field label="Nome completo" value={credenciado.nomeCompleto} />
          <Field label="Categoria" value={credenciado.categoria} />
          <Field label="Status credenciamento" value={credenciado.statusCredenciamento} />
          <Field label="E-mail" value={credenciado.email} />
          <Field label="Celular" value={credenciado.celular} />
          <Field label="Municipio/UF" value={`${credenciado.municipio}/${credenciado.uf}`} />
          <Field label="CPF" value={credenciado.cpf} />
          <Field label="RG" value={credenciado.rg} />
          <Field label="LGPD" value={credenciado.aceitouLgpd ? "Aceito" : "Nao"} />
          <Field label="Codigo da credencial" value={credenciado.credencial?.codigoUnico} />
          <Field label="Status da credencial" value={credenciado.credencial?.statusCredencial} />
          <Field label="Funcao/Cargo" value={credenciado.funcaoCargo} />
          <Field label="Nome empresa" value={credenciado.nomeEmpresa} />
          <Field label="Nome veiculo" value={credenciado.nomeVeiculo} />
          <Field label="Nome propriedade" value={credenciado.nomePropriedade} />
          <Field label="CCIR" value={credenciado.ccir} />
        </div>

        <h4>Historico basico</h4>
        <ul className="event-list compact">
          {eventos.map((evento) => (
            <li key={evento.id} className="event-item">
              <strong>{evento.tipoEvento}</strong>
              <span>{evento.descricao}</span>
              <small>{new Date(evento.createdAt).toLocaleString("pt-BR")}</small>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
