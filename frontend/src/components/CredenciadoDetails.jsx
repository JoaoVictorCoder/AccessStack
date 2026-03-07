export default function CredenciadoDetails({ selected, selectedEvents }) {
  if (!selected) {
    return <p>Selecione um credenciado para ver detalhes e eventos.</p>;
  }

  return (
    <>
      <h3>Detalhes da Identidade</h3>
      <pre className="details">{JSON.stringify(selected, null, 2)}</pre>

      <h3>Historico de Eventos</h3>
      <pre className="details">{JSON.stringify(selectedEvents, null, 2)}</pre>
    </>
  );
}
