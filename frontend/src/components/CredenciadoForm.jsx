import {
  categoryExtraFields,
  categoryOptions,
  commonFields,
  formFieldLabelKeyByField
} from "../constants/formConfig";
import { t } from "../locales";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select } from "./ui/select";

const stateCodeOptions = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
  "EX"
];

function getFieldLabel(fieldName) {
  return t(formFieldLabelKeyByField[fieldName] || fieldName);
}

function getDocumentHintByCategory(category) {
  if (category === "CAFEICULTOR") return t("form.documentHintProducer");
  if (category === "EXPOSITOR" || category === "IMPRENSA") return t("form.documentHintCompany");
  if (category === "COMISSAO_ORGANIZADORA") return t("form.documentHintGovernance");
  return t("form.documentHintDefault");
}

function FieldError({ show, message }) {
  if (!show || !message) return null;
  return <small className="text-xs text-destructive">{t(message)}</small>;
}

export default function CredenciadoForm({
  form,
  saving,
  errors = {},
  touched = {},
  onChange,
  onBlur,
  onSubmit
}) {
  const extraFields = categoryExtraFields[form.categoria] || [];
  const isInternationalVisitor =
    form.categoria === "VISITANTE" &&
    form.nacionalidade &&
    form.nacionalidade.toLowerCase() !== "brasil";

  const shouldShowError = (field) => touched[field] && errors[field];
  const inputErrorClass = (field) =>
    shouldShowError(field) ? "border-destructive focus-visible:ring-destructive" : "";

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="field-stack">
        <Label htmlFor="categoria">{t("form.category")} *</Label>
        <Select id="categoria" name="categoria" value={form.categoria} onChange={onChange} required>
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.labelKey)}
            </option>
          ))}
        </Select>
      </div>

      {commonFields.map((fieldName) => (
        <div key={fieldName} className="field-stack">
          <Label htmlFor={fieldName}>{getFieldLabel(fieldName)} *</Label>
          {fieldName === "uf" ? (
            <Select
              id={fieldName}
              name={fieldName}
              value={form[fieldName]}
              onChange={onChange}
              onBlur={onBlur}
              className={inputErrorClass(fieldName)}
              required={!isInternationalVisitor}
            >
              <option value="">{t("form.selectOne")}</option>
              {stateCodeOptions.map((stateCode) => (
                <option key={stateCode} value={stateCode}>
                  {stateCode}
                </option>
              ))}
            </Select>
          ) : (
            <Input
              id={fieldName}
              name={fieldName}
              value={form[fieldName]}
              onChange={onChange}
              onBlur={onBlur}
              required
              className={inputErrorClass(fieldName)}
            />
          )}
          <FieldError show={shouldShowError(fieldName)} message={errors[fieldName]} />
        </div>
      ))}

      <div className="field-stack">
        <Label htmlFor="cpf">{getFieldLabel("cpf")}</Label>
        <Input
          id="cpf"
          name="cpf"
          value={form.cpf}
          onChange={onChange}
          onBlur={onBlur}
          className={inputErrorClass("cpf")}
        />
        <FieldError show={shouldShowError("cpf")} message={errors.cpf} />
      </div>

      <div className="field-stack">
        <Label htmlFor="cnpj">{getFieldLabel("cnpj")}</Label>
        <Input
          id="cnpj"
          name="cnpj"
          value={form.cnpj}
          onChange={onChange}
          onBlur={onBlur}
          className={inputErrorClass("cnpj")}
        />
        <FieldError show={shouldShowError("cnpj")} message={errors.cnpj} />
      </div>

      <p className="md:col-span-2 text-xs text-muted-foreground">{getDocumentHintByCategory(form.categoria)}</p>
      {errors.documento && <p className="md:col-span-2 text-sm font-medium text-destructive">{t(errors.documento)}</p>}

      {extraFields.map((fieldName) => (
        <div key={fieldName} className="field-stack">
          <Label htmlFor={fieldName}>
            {getFieldLabel(fieldName)} {fieldName !== "siteEmpresa" ? "*" : `(${t("common.optional")})`}
          </Label>
          <Input
            id={fieldName}
            name={fieldName}
            value={form[fieldName]}
            onChange={onChange}
            onBlur={onBlur}
            required={
              fieldName === "nacionalidade"
                ? form.categoria === "VISITANTE"
                : fieldName !== "siteEmpresa"
            }
            placeholder={
              fieldName === "nacionalidade" || fieldName === "nacionalidadeEmpresa" ? "Brasil" : undefined
            }
            className={inputErrorClass(fieldName)}
          />
          <FieldError show={shouldShowError(fieldName)} message={errors[fieldName]} />
        </div>
      ))}

      <label className="md:col-span-2 flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="pcd"
          checked={form.pcd}
          onChange={onChange}
          className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
        />
        {getFieldLabel("pcd")}
      </label>

      <label className="md:col-span-2 flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="aceitouLgpd"
          checked={form.aceitouLgpd}
          onChange={onChange}
          onBlur={onBlur}
          required
          className={cn(
            "h-4 w-4 rounded border-input text-primary focus:ring-ring",
            shouldShowError("aceitouLgpd") ? "border-destructive" : ""
          )}
        />
        {t("form.privacyConsentLabel")}
      </label>

      <label className="md:col-span-2 flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="aceitouCompartilhamentoComExpositores"
          checked={form.aceitouCompartilhamentoComExpositores}
          onChange={onChange}
          className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
        />
        {getFieldLabel("aceitouCompartilhamentoComExpositores")}
      </label>

      <FieldError show={shouldShowError("aceitouLgpd")} message={errors.aceitouLgpd} />

      <p className="md:col-span-2 rounded-md border bg-zinc-50 p-3 text-xs text-muted-foreground">
        {t("form.privacyDisclaimer")}
      </p>

      <Button type="submit" disabled={saving} className="md:col-span-2">
        {saving ? t("form.submitting") : t("form.submit")}
      </Button>
    </form>
  );
}
