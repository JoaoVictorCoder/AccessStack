import {
  categoryExtraFields,
  categoriaOptions,
  commonFields,
  labels
} from "../constants/formConfig";

export default function CredenciadoForm({
  form,
  saving,
  onChange,
  onSubmit
}) {
  const extraFields = categoryExtraFields[form.categoria] || [];

  return (
    <form onSubmit={onSubmit} className="grid">
      <label>
        Categoria
        <select name="categoria" value={form.categoria} onChange={onChange} required>
          {categoriaOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      {commonFields.map((field) => (
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
      <p className="lgpd-text">
        Ao enviar, voce autoriza o tratamento dos seus dados pessoais para fins de
        credenciamento e controle de acesso do evento.
      </p>

      <button type="submit" disabled={saving}>
        {saving ? "Salvando..." : "Cadastrar"}
      </button>
    </form>
  );
}
