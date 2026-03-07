export default function CredenciadosList({ list, onSelect }) {
  return (
    <ul className="list">
      {list.map((item) => (
        <li key={item.id}>
          <button type="button" onClick={() => onSelect(item.id)}>
            <strong>{item.nomeCompleto}</strong>
            <span>
              {item.categoria} | {item.statusCredenciamento}
            </span>
            <span>Credencial: {item.credencial?.codigoUnico || "N/A"}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
