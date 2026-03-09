import { useState } from "react";
import {
  createPublicParticipant,
  getPublicCredentialPdfUrl,
  getPublicCredentialQr
} from "../api/platformApi";
import CredenciadoForm from "../components/CredenciadoForm";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { publicBaseForm } from "../constants/formConfig";
import { t } from "../locales";
import { formatCellphone, formatCnpj, formatCpf, validatePublicParticipantForm } from "../utils/validation";

const touchedFieldsOnSubmit = {
  nomeCompleto: true,
  cpf: true,
  cnpj: true,
  celular: true,
  email: true,
  municipio: true,
  uf: true,
  nacionalidade: true,
  nacionalidadeEmpresa: true,
  aceitouLgpd: true,
  aceitouCompartilhamentoComExpositores: true,
  nomeEmpresa: true,
  siteEmpresa: true,
  ccir: true,
  nomePropriedade: true,
  nomeVeiculo: true,
  funcaoCargo: true
};

function formatFieldValue(fieldName, value, type, checked) {
  if (type === "checkbox") return checked;
  if (fieldName === "cpf") return formatCpf(value);
  if (fieldName === "cnpj") return formatCnpj(value);
  if (fieldName === "celular") return formatCellphone(value);
  return value;
}

function CredentialSummary({ participant, qrDataUrl }) {
  if (!participant?.credencial?.id) {
    return <p className="text-sm text-muted-foreground">{t("public.credentialPlaceholder")}</p>;
  }

  return (
    <div className="space-y-4">
      <dl className="grid gap-3 md:grid-cols-2">
        <div className="rounded-md border bg-zinc-50 p-3">
          <dt className="text-xs text-muted-foreground">{t("public.categoryLabel")}</dt>
          <dd className="text-sm font-semibold">{participant.categoria}</dd>
        </div>
        <div className="rounded-md border bg-zinc-50 p-3">
          <dt className="text-xs text-muted-foreground">{t("public.registrationStatus")}</dt>
          <dd className="text-sm font-semibold">{participant.statusCredenciamento}</dd>
        </div>
        <div className="rounded-md border bg-zinc-50 p-3">
          <dt className="text-xs text-muted-foreground">{t("public.credentialCode")}</dt>
          <dd className="text-sm font-semibold">{participant.credencial?.codigoUnico || "-"}</dd>
        </div>
        <div className="rounded-md border bg-zinc-50 p-3">
          <dt className="text-xs text-muted-foreground">{t("public.credentialPdf")}</dt>
          <dd>
            <Button asChild variant="outline" size="sm">
              <a target="_blank" rel="noreferrer" href={getPublicCredentialPdfUrl(participant.credencial.id)}>
                {t("common.openPdf")}
              </a>
            </Button>
          </dd>
        </div>
      </dl>

      {qrDataUrl && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">{t("public.qrTitle")}</h3>
          <img
            src={qrDataUrl}
            alt={t("public.qrAlt")}
            className="max-w-[240px] rounded-md border bg-card p-2"
          />
        </div>
      )}
    </div>
  );
}

export default function PublicAreaPage() {
  const [form, setForm] = useState(publicBaseForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createdParticipant, setCreatedParticipant] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    const nextValue = formatFieldValue(name, value, type, checked);

    setForm((currentForm) => {
      const nextForm = { ...currentForm, [name]: nextValue };
      const { errors } = validatePublicParticipantForm(nextForm);
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        [name]: errors[name],
        documento: errors.documento
      }));
      return nextForm;
    });
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouchedFields((currentTouched) => ({ ...currentTouched, [name]: true }));
    const { errors } = validatePublicParticipantForm(form);
    setFieldErrors(errors);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const { errors, normalized } = validatePublicParticipantForm(form);
      setFieldErrors(errors);
      setTouchedFields(touchedFieldsOnSubmit);

      if (Object.keys(errors).length > 0) {
        throw new Error(t("public.reviseFieldsError"));
      }

      const created = await createPublicParticipant(normalized);
      setCreatedParticipant(created);
      setSuccessMessage(
        t("public.successMessage", { code: created.credencial?.codigoUnico || t("common.notAvailable") })
      );

      if (created.credencial?.id) {
        const qrResponse = await getPublicCredentialQr(created.credencial.id);
        setQrDataUrl(qrResponse.qrcode || "");
      }

      setForm((currentForm) => ({ ...publicBaseForm, categoria: currentForm.categoria }));
      setFieldErrors({});
      setTouchedFields({});
    } catch (submitError) {
      setErrorMessage(submitError.message || t("public.fallbackError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid gap-4 xl:grid-cols-[minmax(320px,34%)_minmax(0,66%)]">
      <Card className="border-zinc-200 bg-zinc-900 text-zinc-50">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-zinc-100 text-zinc-900">
              {t("public.heroChipPrimary")}
            </Badge>
            <Badge variant="outline" className="border-zinc-500 text-zinc-200">
              {t("public.heroChipSecondary")}
            </Badge>
          </div>
          <CardTitle className="text-zinc-50">{t("public.heroTitle")}</CardTitle>
          <CardDescription className="text-zinc-300">{t("public.heroText")}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto space-y-1">
          <p className="text-sm font-semibold text-zinc-100">{t("public.heroMetaTitle")}</p>
          <p className="text-sm text-zinc-300">{t("public.heroMetaSubtitle")}</p>
        </CardContent>
      </Card>

      <Card className="border-zinc-200">
        <CardHeader>
          <CardTitle>{t("public.sectionTitle")}</CardTitle>
          <CardDescription>{t("public.sectionSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CredenciadoForm
            form={form}
            saving={isSubmitting}
            errors={fieldErrors}
            touched={touchedFields}
            onChange={handleChange}
            onBlur={handleBlur}
            onSubmit={handleSubmit}
          />

          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert variant="success">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {createdParticipant?.id && (
            <p className="text-sm text-muted-foreground">
              {t("public.registrationId", { id: createdParticipant.id })}
            </p>
          )}

          <div className="space-y-3 border-t pt-4">
            <Alert>
              <AlertTitle>{t("public.credentialSectionTitle")}</AlertTitle>
              <AlertDescription />
            </Alert>
            <CredentialSummary participant={createdParticipant} qrDataUrl={qrDataUrl} />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
