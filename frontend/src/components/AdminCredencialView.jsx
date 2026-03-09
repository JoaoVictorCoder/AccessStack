import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { t } from "../locales";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";

function DetailRow({ label, value }) {
  return (
    <div className="rounded-md border bg-zinc-50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium break-all">{value || "-"}</p>
    </div>
  );
}

export default function AdminCredencialView({ data, loading, saving, error, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    codigoUnico: "",
    statusCredencial: "GERADA",
    qrCodePayload: "",
    emitidaEm: ""
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      codigoUnico: data.codigoUnico || "",
      statusCredencial: data.statusCredencial || "GERADA",
      qrCodePayload: data.qrCodePayload || "",
      emitidaEm: data.emitidaEm ? new Date(data.emitidaEm).toISOString().slice(0, 16) : ""
    });
  }, [data?.id]);

  return (
    <main className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>{t("credentialPage.title")}</CardTitle>
          <Button asChild variant="outline">
            <Link to="/admin">{t("credentialPage.backToDashboard")}</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <p className="text-sm text-muted-foreground">{t("credentialPage.loading")}</p>}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {data && (
            <>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setIsEditing((value) => !value)}>
                  {isEditing ? t("credentialPage.toggleEdit.on") : t("credentialPage.toggleEdit.off")}
                </Button>
              </div>

              {isEditing && (
                <form
                  className="grid gap-3 rounded-md border bg-zinc-50 p-4 md:grid-cols-2"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    await onSave({
                      codigoUnico: form.codigoUnico,
                      statusCredencial: form.statusCredencial,
                      qrCodePayload: form.qrCodePayload,
                      emitidaEm: form.emitidaEm ? new Date(form.emitidaEm).toISOString() : null
                    });
                    setIsEditing(false);
                  }}
                >
                  <div className="field-stack">
                    <Label>{t("credentialPage.uniqueCode")}</Label>
                    <Input
                      value={form.codigoUnico}
                      onChange={(event) =>
                        setForm((currentForm) => ({ ...currentForm, codigoUnico: event.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="field-stack">
                    <Label>{t("credentialPage.credentialStatus")}</Label>
                    <Select
                      value={form.statusCredencial}
                      onChange={(event) =>
                        setForm((currentForm) => ({
                          ...currentForm,
                          statusCredencial: event.target.value
                        }))
                      }
                    >
                      <option value="GERADA">GERADA</option>
                      <option value="ATIVA">ATIVA</option>
                      <option value="INATIVA">INATIVA</option>
                      <option value="UTILIZADA">UTILIZADA</option>
                      <option value="CANCELADA">CANCELADA</option>
                    </Select>
                  </div>
                  <div className="field-stack">
                    <Label>{t("credentialPage.issuedAt")}</Label>
                    <Input
                      type="datetime-local"
                      value={form.emitidaEm}
                      onChange={(event) =>
                        setForm((currentForm) => ({ ...currentForm, emitidaEm: event.target.value }))
                      }
                    />
                  </div>
                  <div className="field-stack md:col-span-2">
                    <Label>{t("credentialPage.qrPayload")}</Label>
                    <Textarea
                      value={form.qrCodePayload}
                      onChange={(event) =>
                        setForm((currentForm) => ({ ...currentForm, qrCodePayload: event.target.value }))
                      }
                      rows={5}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={saving} className="md:col-span-2">
                    {saving ? t("credentialPage.saving") : t("credentialPage.saveCredential")}
                  </Button>
                </form>
              )}

              <h3 className="text-sm font-semibold">{t("credentialPage.sectionCredential")}</h3>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <DetailRow label="ID" value={data.id} />
                <DetailRow label={t("credentialPage.uniqueCode")} value={data.codigoUnico} />
                <DetailRow label={t("credentialPage.credentialStatus")} value={data.statusCredencial} />
                <DetailRow label={t("credentialPage.issuedAt")} value={new Date(data.emitidaEm).toLocaleString()} />
                <DetailRow label={t("credentialPage.qrPayload")} value={data.qrCodePayload} />
              </div>

              <h3 className="text-sm font-semibold">{t("credentialPage.sectionIdentity")}</h3>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <DetailRow label={t("table.name")} value={data.credenciado?.nomeCompleto} />
                <DetailRow label={t("table.category")} value={data.credenciado?.categoria} />
                <DetailRow label={t("table.email")} value={data.credenciado?.email} />
                <DetailRow label={t("table.phone")} value={data.credenciado?.celular} />
                <DetailRow
                  label={t("table.cityState")}
                  value={`${data.credenciado?.municipio || ""}/${data.credenciado?.uf || ""}`}
                />
                <DetailRow
                  label={t("credentialPage.registrationStatus")}
                  value={data.credenciado?.statusCredenciamento}
                />
                <DetailRow label={t("form.cpf")} value={data.credenciado?.cpf} />
                <DetailRow label={t("form.cnpj")} value={data.credenciado?.cnpj} />
                <DetailRow label={t("form.nationality")} value={data.credenciado?.nacionalidade} />
                <DetailRow
                  label={t("form.companyNationality")}
                  value={data.credenciado?.nacionalidadeEmpresa}
                />
                <DetailRow label={t("form.pcd")} value={data.credenciado?.pcd ? t("common.yes") : t("common.no")} />
                <DetailRow
                  label={t("credentialPage.privacyAccepted")}
                  value={data.credenciado?.aceitouLgpd ? t("table.accepted") : t("table.denied")}
                />
                <DetailRow
                  label={t("credentialPage.dataSharingAccepted")}
                  value={
                    data.credenciado?.aceitouCompartilhamentoComExpositores
                      ? t("table.accepted")
                      : t("table.denied")
                  }
                />
                <DetailRow label={t("credentialPage.event")} value={data.credenciado?.evento?.nomeEvento} />
                <DetailRow label={t("form.companyName")} value={data.credenciado?.nomeEmpresa} />
                <DetailRow label={t("form.vehicleName")} value={data.credenciado?.nomeVeiculo} />
                <DetailRow label={t("credentialPage.roleFunction")} value={data.credenciado?.funcaoCargo} />
                <DetailRow label={t("form.ccir")} value={data.credenciado?.ccir} />
                <DetailRow label={t("credentialPage.propertyName")} value={data.credenciado?.nomePropriedade} />
                <DetailRow label={t("credentialPage.companyWebsite")} value={data.credenciado?.siteEmpresa} />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
