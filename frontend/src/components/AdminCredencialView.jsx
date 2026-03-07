import { Link } from "react-router-dom";

function Row({ label, value }) {
  return (
    <div className="detail-field">
      <span>{label}</span>
      <strong>{value || "-"}</strong>
    </div>
  );
}

export default function AdminCredencialView({ data, loading, error }) {
  return (
    <main className="single-page">
      <section className="card">
        <div className="admin-header">
          <h2>Consulta de Credencial</h2>
          <Link className="link-button" to="/admin">
            Voltar ao painel
          </Link>
        </div>

        {loading && <p>Carregando credencial...</p>}
        {error && <p className="error">{error}</p>}

        {data && (
          <>
            <h3>Credencial</h3>
            <div className="details-grid">
              <Row label="ID credencial" value={data.id} />
              <Row label="Codigo unico" value={data.codigoUnico} />
              <Row label="Status credencial" value={data.statusCredencial} />
              <Row label="Emitida em" value={new Date(data.emitidaEm).toLocaleString("pt-BR")} />
            </div>

            <h3>Identidade vinculada</h3>
            <div className="details-grid">
              <Row label="Nome completo" value={data.credenciado?.nomeCompleto} />
              <Row label="Categoria" value={data.credenciado?.categoria} />
              <Row label="E-mail" value={data.credenciado?.email} />
              <Row label="Celular" value={data.credenciado?.celular} />
              <Row
                label="Municipio/UF"
                value={`${data.credenciado?.municipio || ""}/${data.credenciado?.uf || ""}`}
              />
              <Row
                label="Status credenciamento"
                value={data.credenciado?.statusCredenciamento}
              />
              <Row label="CPF" value={data.credenciado?.cpf} />
              <Row label="RG" value={data.credenciado?.rg} />
              <Row label="LGPD" value={data.credenciado?.aceitouLgpd ? "Aceito" : "Nao"} />
              <Row label="Nome empresa" value={data.credenciado?.nomeEmpresa} />
              <Row label="Nome veiculo" value={data.credenciado?.nomeVeiculo} />
              <Row label="Funcao/Cargo" value={data.credenciado?.funcaoCargo} />
              <Row label="CCIR" value={data.credenciado?.ccir} />
              <Row label="Nome propriedade" value={data.credenciado?.nomePropriedade} />
              <Row label="CNPJ" value={data.credenciado?.cnpj} />
              <Row label="Site empresa" value={data.credenciado?.siteEmpresa} />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
