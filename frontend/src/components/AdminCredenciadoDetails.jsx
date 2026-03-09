import { useState } from "react";
import {
  categoryOptions,
  formFieldLabelKeyByField,
  governanceCategoryOption
} from "../constants/formConfig";
import { t } from "../locales";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select } from "./ui/select";

function Field({ label, value }) {
  return (
    <div className="rounded-md border bg-zinc-50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "-"}</p>
    </div>
  );
}

const editableTextFields = [
  "nomeCompleto",
  "cpf",
  "cnpj",
  "celular",
  "email",
  "municipio",
  "uf",
  "nacionalidade",
  "nacionalidadeEmpresa",
  "siteEmpresa",
  "nomeEmpresa",
  "nomeVeiculo",
  "nomePropriedade",
  "ccir",
  "funcaoCargo"
];

export default function AdminCredenciadoDetails({
  credenciado,
  historyEvents,
  onClose,
  onSave,
  onSoftDelete,
  onCredentialStatusChange,
  onReissue
}) {
  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    nomeCompleto: credenciado?.nomeCompleto || "",
    categoria: credenciado?.categoria || "",
    cpf: credenciado?.cpf || "",
    cnpj: credenciado?.cnpj || "",
    celular: credenciado?.celular || "",
    email: credenciado?.email || "",
    municipio: credenciado?.municipio || "",
    uf: credenciado?.uf || "",
    nomeEmpresa: credenciado?.nomeEmpresa || "",
    siteEmpresa: credenciado?.siteEmpresa || "",
    nomeVeiculo: credenciado?.nomeVeiculo || "",
    nomePropriedade: credenciado?.nomePropriedade || "",
    ccir: credenciado?.ccir || "",
    funcaoCargo: credenciado?.funcaoCargo || "",
    nacionalidade: credenciado?.nacionalidade || "",
    nacionalidadeEmpresa: credenciado?.nacionalidadeEmpresa || "",
    aceitouLgpd: credenciado?.aceitouLgpd === true,
    aceitouCompartilhamentoComExpositores:
      credenciado?.aceitouCompartilhamentoComExpositores === true,
    pcd: credenciado?.pcd === true
  });

  if (!credenciado) return null;

  return (
    <Dialog open onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>{t("participantDetails.modalTitle")}</DialogTitle>
          <DialogDescription>
            {credenciado.nomeCompleto} | {credenciado.categoria}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => setIsEditing((value) => !value)}>
            {isEditing ? t("participantDetails.toggleEditOn") : t("participantDetails.toggleEditOff")}
          </Button>
          <Button type="button" variant="destructive" onClick={onSoftDelete}>
            {t("participantDetails.deactivateRegistration")}
          </Button>
          <Button type="button" variant="destructive" onClick={() => onCredentialStatusChange("INATIVA")}>
            {t("participantDetails.blockCredential")}
          </Button>
          <Button type="button" variant="outline" onClick={() => onCredentialStatusChange("ATIVA")}>
            {t("participantDetails.reactivateCredential")}
          </Button>
          <Button type="button" variant="outline" onClick={onReissue}>
            {t("participantDetails.reissueCredential")}
          </Button>
          {credenciado?.credencial?.id && (
            <Button asChild type="button" variant="outline">
              <a
                href={`${apiBaseUrl}/credenciais/${credenciado.credencial.id}/pdf`}
                target="_blank"
                rel="noreferrer"
              >
                {t("participantDetails.downloadPdf")}
              </a>
            </Button>
          )}
        </div>

        {isEditing && (
          <form
            className="grid gap-3 rounded-md border bg-zinc-50 p-4 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              onSave(form);
              setIsEditing(false);
            }}
          >
            <div className="field-stack">
              <Label>{t("form.category")}</Label>
              <Select
                value={form.categoria}
                onChange={(event) =>
                  setForm((currentForm) => ({ ...currentForm, categoria: event.target.value }))
                }
              >
                {[...categoryOptions, governanceCategoryOption].map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </Select>
            </div>

            {editableTextFields.map((fieldName) => (
              <div key={fieldName} className="field-stack">
                <Label>{t(formFieldLabelKeyByField[fieldName] || fieldName)}</Label>
                <Input
                  value={form[fieldName] || ""}
                  onChange={(event) =>
                    setForm((currentForm) => ({ ...currentForm, [fieldName]: event.target.value }))
                  }
                />
              </div>
            ))}

            <label className="md:col-span-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.pcd}
                onChange={(event) =>
                  setForm((currentForm) => ({ ...currentForm, pcd: event.target.checked }))
                }
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
              />
              {t("form.pcd")}
            </label>
            <label className="md:col-span-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.aceitouLgpd}
                onChange={(event) =>
                  setForm((currentForm) => ({ ...currentForm, aceitouLgpd: event.target.checked }))
                }
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
              />
              {t("form.privacyConsentLabel")}
            </label>
            <label className="md:col-span-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.aceitouCompartilhamentoComExpositores}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    aceitouCompartilhamentoComExpositores: event.target.checked
                  }))
                }
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
              />
              {t("participantDetails.dataSharingWithExhibitors")}
            </label>
            <Button type="submit" className="md:col-span-2">
              {t("participantDetails.saveChanges")}
            </Button>
          </form>
        )}

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Field label={t("form.fullName")} value={credenciado.nomeCompleto} />
          <Field label={t("form.category")} value={credenciado.categoria} />
          <Field label={t("participantDetails.registrationStatus")} value={credenciado.statusCredenciamento} />
          <Field label={t("table.email")} value={credenciado.email} />
          <Field label={t("table.phone")} value={credenciado.celular} />
          <Field label={t("table.cityState")} value={`${credenciado.municipio}/${credenciado.uf}`} />
          <Field label={t("form.cpf")} value={credenciado.cpf} />
          <Field label={t("form.cnpj")} value={credenciado.cnpj} />
          <Field label={t("form.nationality")} value={credenciado.nacionalidade} />
          <Field label={t("form.companyNationality")} value={credenciado.nacionalidadeEmpresa} />
          <Field label={t("form.pcd")} value={credenciado.pcd ? t("common.yes") : t("common.no")} />
          <Field
            label={t("table.privacy")}
            value={credenciado.aceitouLgpd ? t("table.accepted") : t("table.denied")}
          />
          <Field
            label={t("participantDetails.dataSharingWithExhibitors")}
            value={
              credenciado.aceitouCompartilhamentoComExpositores
                ? t("table.accepted")
                : t("table.denied")
            }
          />
          <Field label={t("credentialPage.event")} value={credenciado.evento?.nomeEvento} />
          <Field label={t("participantDetails.credentialCode")} value={credenciado.credencial?.codigoUnico} />
          <div className="rounded-md border bg-zinc-50 p-3">
            <p className="text-xs text-muted-foreground">{t("participantDetails.credentialStatus")}</p>
            <Badge variant={credenciado.credencial?.statusCredencial === "ATIVA" ? "success" : "secondary"}>
              {credenciado.credencial?.statusCredencial || "-"}
            </Badge>
          </div>
          <Field label={t("form.roleFunction")} value={credenciado.funcaoCargo} />
          <Field label={t("form.companyName")} value={credenciado.nomeEmpresa} />
          <Field label={t("form.vehicleName")} value={credenciado.nomeVeiculo} />
          <Field label={t("form.propertyName")} value={credenciado.nomePropriedade} />
          <Field label={t("form.ccir")} value={credenciado.ccir} />
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold">{t("participantDetails.basicHistoryTitle")}</h4>
          <ul className="max-h-[250px] space-y-2 overflow-auto">
            {historyEvents.map((eventItem) => (
              <li key={eventItem.id} className="rounded-md border bg-zinc-50 p-3">
                <p className="text-sm font-medium">{eventItem.tipoEvento}</p>
                <p className="text-sm text-muted-foreground">{eventItem.descricao}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(eventItem.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
