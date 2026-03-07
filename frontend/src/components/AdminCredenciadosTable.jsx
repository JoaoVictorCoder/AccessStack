import { Link } from "react-router-dom";

export default function AdminCredenciadosTable({ items, onOpenDetails }) {
  return (
    <div className="table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>E-mail</th>
            <th>Celular</th>
            <th>Cidade/UF</th>
            <th>LGPD</th>
            <th>CPF</th>
            <th>Credencial</th>
            <th>Cadastro</th>
            <th>Acoes</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.nomeCompleto}</td>
              <td>{item.categoria}</td>
              <td>{item.email}</td>
              <td>{item.celular}</td>
              <td>
                {item.municipio}/{item.uf}
              </td>
              <td>{item.aceitouLgpd ? "Aceito" : "Nao"}</td>
              <td>{item.cpfMascarado}</td>
              <td>{item.credencial?.codigoUnico || "N/A"}</td>
              <td>{new Date(item.createdAt).toLocaleDateString("pt-BR")}</td>
              <td>
                <div className="table-actions">
                  <button type="button" onClick={() => onOpenDetails(item.id)}>
                    Detalhes
                  </button>
                  {item.credencial?.id && (
                    <Link className="link-button" to={`/admin/credenciais/${item.credencial.id}`}>
                      Credencial
                    </Link>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
