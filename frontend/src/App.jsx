import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const categoriaOptions = [
  { value: "EXPOSITOR", label: "Expositor" },
  { value: "CAFEICULTOR", label: "Cafeicultor" },
  { value: "VISITANTE", label: "Visitante" },
  { value: "IMPRENSA", label: "Imprensa" },
  { value: "COMISSAO_ORGANIZADORA", label: "Comissao Organizadora" },
  { value: "COLABORADOR_TERCEIRIZADO", label: "Colaborador Terceirizado" }
];

const categoryExtraFields = {
  EXPOSITOR: ["cnpj", "siteEmpresa", "nomeEmpresa"],
  CAFEICULTOR: ["ccir", "nomePropriedade"],
  VISITANTE: [],
  IMPRENSA: ["cnpj", "nomeVeiculo", "siteEmpresa"],
  COMISSAO_ORGANIZADORA: ["funcaoCargo"],
  COLABORADOR_TERCEIRIZADO: ["cnpj", "nomeEmpresa", "funcaoCargo"]
};

const labels = {
  nomeCompleto: "Nome completo",
  cpf: "CPF",
  rg: "RG",
  celular: "Celular",
  email: "E-mail",
  municipio: "Municipio",
  uf: "UF",
  cnpj: "CNPJ",
  siteEmpresa: "Site da empresa",
  nomeEmpresa: "Nome da empresa",
  ccir: "CCIR",
  nomePropriedade: "Nome da propriedade",
  nomeVeiculo: "Nome do veiculo",
  funcaoCargo: "Funcao/Cargo"
};

const baseForm = {
  categoria: "EXPOSITOR",
  nomeCompleto: "",
  cpf: "",
  rg: "",
  celular: "",
  email: "",
  municipio: "",
  uf: "",
  aceitouLgpd: false,
  cnpj: "",
  siteEmpresa: "",
  nomeEmpresa: "",
  ccir: "",
  nomePropriedade: "",
  nomeVeiculo: "",
  funcaoCargo: ""
};

function App() {
  const [form, setForm] = useState(baseForm);
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const extraFields = useMemo(
    () => categoryExtraFields[form.categoria] || [],
    [form.categoria]
  );

  async function loadCredenciados() {
    const response = await fetch(`${API_URL}/credenciados`);
    const data = await response.json();
    setList(data);
  }

  async function loadCredenciado(id) {
    const response = await fetch(`${API_URL}/credenciados/${id}`);
    const data = await response.json();
    setSelected(data);
  }

  useEffect(() => {
    loadCredenciados().catch(() => {
      setError("Nao foi possivel carregar a lista.");
    });
  }, []);

  function onChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/credenciados`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (data.errors || []).join(", "));
      }

      setForm((prev) => ({
        ...baseForm,
        categoria: prev.categoria
      }));
      await loadCredenciados();
    } catch (submitError) {
      setError(submitError.message || "Erro ao cadastrar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page">
      <section className="card">
        <h1>Credenciamento - Setor Cafeeiro</h1>
        <p>Checkpoint 1 - Cadastro de participantes</p>

        <form onSubmit={onSubmit} className="grid">
          <label>
            Categoria
            <select
              name="categoria"
              value={form.categoria}
              onChange={onChange}
              required
            >
              {categoriaOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          {[
            "nomeCompleto",
            "cpf",
            "rg",
            "celular",
            "email",
            "municipio",
            "uf"
          ].map((field) => (
            <label key={field}>
              {labels[field]}
              <input
                name={field}
                value={form[field]}
                onChange={onChange}
                required
                maxLength={field === "uf" ? 2 : undefined}
              />
            </label>
          ))}

          {extraFields.map((field) => (
            <label key={field}>
              {labels[field]}
              <input name={field} value={form[field]} onChange={onChange} required />
            </label>
          ))}

          <label className="checkbox">
            <input
              type="checkbox"
              name="aceitouLgpd"
              checked={form.aceitouLgpd}
              onChange={onChange}
              required
            />
            Aceito os termos da LGPD
          </label>

          <button type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Cadastrar"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}
      </section>

      <section className="card">
        <h2>Credenciados</h2>
        <ul className="list">
          {list.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => loadCredenciado(item.id)}>
                {item.nomeCompleto} - {item.categoria}
              </button>
            </li>
          ))}
        </ul>

        {selected && (
          <pre className="details">{JSON.stringify(selected, null, 2)}</pre>
        )}
      </section>
    </main>
  );
}

export default App;
