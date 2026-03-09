import { useState } from "react";
import { categoryOptions, governanceCategoryOption } from "../constants/formConfig";
import { t } from "../locales";
import AdminComissaoForm from "./AdminComissaoForm";
import AdminCredenciadoDetails from "./AdminCredenciadoDetails";
import AdminCredenciadosTable from "./AdminCredenciadosTable";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select } from "./ui/select";

const categoryFilterOptions = [
  { value: "", labelKey: "common.unrestricted" },
  ...categoryOptions,
  governanceCategoryOption
];

function EventList({ items, emptyMessage }) {
  if (!items?.length) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ul className="max-h-[300px] space-y-2 overflow-auto">
      {items.map((item) => (
        <li key={item.id || `${item.type}-${item.message}`} className="rounded-md border bg-zinc-50 p-3">
          {item.tipoEvento && <p className="text-sm font-medium">{item.tipoEvento}</p>}
          {item.acao && <p className="text-sm font-medium">{item.acao}</p>}
          {item.type && <p className="text-sm font-medium">{item.type}</p>}
          {item.descricao && <p className="text-sm text-muted-foreground">{item.descricao}</p>}
          {item.message && <p className="text-sm text-muted-foreground">{item.message}</p>}
          {item.createdAt && (
            <p className="mt-1 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
          )}
          {item.actor && (
            <p className="mt-1 text-xs text-muted-foreground">
              {item.actor?.nome || item.actorType} | {item.recurso}
            </p>
          )}
          {item.severity && (
            <p className="mt-1 text-xs text-muted-foreground">
              {t("adminDashboard.severityCount", { severity: item.severity, count: item.count })}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function AdminDashboard({
  admin,
  listResponse,
  systemEvents,
  loading,
  error,
  filters,
  onChangeFilters,
  onReload,
  onOpenDetails,
  selectedDetails,
  selectedEvents,
  onCloseDetails,
  onSaveDetails,
  onSoftDeleteDetails,
  onCredentialStatusChange,
  onReissueCredential,
  onCreateGovernanceMember,
  creatingGovernanceMember,
  createGovernanceError,
  onLogout,
  auditLogs,
  onRunCheckIn,
  checkInResult,
  checkInLoading,
  analyticsOverview,
  analyticsFraud
}) {
  const [showGovernanceForm, setShowGovernanceForm] = useState(false);
  const [activeSection, setActiveSection] = useState("credenciados");
  const [checkInForm, setCheckInForm] = useState({
    codigoUnico: "",
    gateCode: "GATE-ENTRY-01",
    accessPoint: "Main Gate"
  });

  const items = listResponse?.items || [];
  const page = listResponse?.page || 1;
  const totalPages = listResponse?.totalPages || 1;
  const isGovernanceProfile = admin?.role === "COMISSAO_ORGANIZADORA";

  return (
    <main className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>{t("adminDashboard.title")}</CardTitle>
            <CardDescription>
              {t("adminDashboard.loggedAs", { name: admin?.nome || admin?.email || "-" })}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isGovernanceProfile && (
              <Button type="button" onClick={() => setShowGovernanceForm(true)}>
                {t("adminDashboard.addGovernanceMember")}
              </Button>
            )}
            <Button type="button" variant="secondary" onClick={onReload} disabled={loading}>
              {loading ? t("common.refreshing") : t("common.refresh")}
            </Button>
            <Button type="button" variant="outline" onClick={onLogout}>
              {t("common.logout")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isGovernanceProfile && (
            <div className="grid gap-3 md:grid-cols-3">
              <div className="field-stack">
                <Label>{t("adminDashboard.section")}</Label>
                <Select value={activeSection} onChange={(event) => setActiveSection(event.target.value)}>
                  <option value="credenciados">{t("adminDashboard.sectionParticipants")}</option>
                  <option value="eventos">{t("adminDashboard.sectionSystemEvents")}</option>
                  <option value="audit">{t("adminDashboard.sectionAuditLogs")}</option>
                  <option value="checkin">{t("adminDashboard.sectionCheckIn")}</option>
                  <option value="analytics">{t("adminDashboard.sectionAnalytics")}</option>
                </Select>
              </div>
              <div className="field-stack">
                <Label>{t("adminDashboard.search")}</Label>
                <Input
                  value={filters.search}
                  placeholder={t("adminDashboard.searchPlaceholder")}
                  onChange={(event) =>
                    onChangeFilters({ ...filters, search: event.target.value, page: 1 })
                  }
                />
              </div>
              <div className="field-stack">
                <Label>{t("adminDashboard.category")}</Label>
                <Select
                  value={filters.categoria}
                  onChange={(event) =>
                    onChangeFilters({ ...filters, categoria: event.target.value, page: 1 })
                  }
                >
                  {categoryFilterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          )}

          {isGovernanceProfile && (
            <p className="text-sm text-muted-foreground">{t("adminDashboard.governanceScopeText")}</p>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isGovernanceProfile && activeSection === "credenciados" && (
            <>
              <AdminCredenciadosTable items={items} onOpenDetails={onOpenDetails} />
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => onChangeFilters({ ...filters, page: page - 1 })}
                >
                  {t("common.previous")}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {t("common.pageOf", { page, totalPages })}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => onChangeFilters({ ...filters, page: page + 1 })}
                >
                  {t("common.next")}
                </Button>
              </div>
            </>
          )}

          {!isGovernanceProfile && activeSection === "eventos" && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold">{t("adminDashboard.recentEventsTitle")}</h3>
              <EventList items={systemEvents} emptyMessage="No system events found." />
            </div>
          )}

          {!isGovernanceProfile && activeSection === "audit" && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold">{t("adminDashboard.auditTrailTitle")}</h3>
              <EventList items={auditLogs} emptyMessage="No audit logs found." />
            </div>
          )}

          {!isGovernanceProfile && activeSection === "checkin" && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold">{t("adminDashboard.accessControlTitle")}</h3>
              <form
                className="grid gap-3 md:grid-cols-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  onRunCheckIn(checkInForm);
                }}
              >
                <div className="field-stack">
                  <Label>{t("adminDashboard.uniqueCode")}</Label>
                  <Input
                    value={checkInForm.codigoUnico}
                    onChange={(event) =>
                      setCheckInForm((currentForm) => ({
                        ...currentForm,
                        codigoUnico: event.target.value
                      }))
                    }
                    required
                  />
                </div>
                <div className="field-stack">
                  <Label>{t("adminDashboard.accessPointCode")}</Label>
                  <Input
                    value={checkInForm.gateCode}
                    onChange={(event) =>
                      setCheckInForm((currentForm) => ({ ...currentForm, gateCode: event.target.value }))
                    }
                    required
                  />
                </div>
                <div className="field-stack md:col-span-2">
                  <Label>{t("adminDashboard.accessPoint")}</Label>
                  <Input
                    value={checkInForm.accessPoint}
                    onChange={(event) =>
                      setCheckInForm((currentForm) => ({
                        ...currentForm,
                        accessPoint: event.target.value
                      }))
                    }
                  />
                </div>
                <Button className="md:col-span-2" type="submit" disabled={checkInLoading}>
                  {checkInLoading ? t("adminDashboard.validating") : t("adminDashboard.validateAccess")}
                </Button>
              </form>

              {checkInResult && (
                <Alert variant={checkInResult.resultado === "ALLOW" ? "success" : "destructive"}>
                  <AlertTitle>
                    {t("adminDashboard.resultLabel", { result: checkInResult.resultado })}
                  </AlertTitle>
                  <AlertDescription>
                    <p>{t("adminDashboard.reasonLabel", { reason: checkInResult.motivo })}</p>
                    <p>
                      {t("adminDashboard.credentialLabel", {
                        code: checkInResult.codigoUnico || t("common.notAvailable")
                      })}
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {!isGovernanceProfile && activeSection === "analytics" && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold">{t("adminDashboard.sectionAnalytics")}</h3>
              {analyticsOverview && (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Card className="border-zinc-200">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">{t("adminDashboard.totalParticipants")}</p>
                      <p className="text-2xl font-semibold">{analyticsOverview.totalCredenciados}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-zinc-200">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">{t("adminDashboard.totalCredentials")}</p>
                      <p className="text-2xl font-semibold">{analyticsOverview.totalCredenciaisGeradas}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-zinc-200">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">{t("adminDashboard.allowedCheckIns")}</p>
                      <p className="text-2xl font-semibold">{analyticsOverview.totalCheckInsPermitidos}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-zinc-200">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">{t("adminDashboard.deniedCheckIns")}</p>
                      <p className="text-2xl font-semibold">{analyticsOverview.totalCheckInsNegados}</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">{t("adminDashboard.fraudSignalsTitle")}</h4>
                {(analyticsFraud || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No anomalies detected.</p>
                ) : (
                  <ul className="space-y-2">
                    {(analyticsFraud || []).map((item, index) => (
                      <li key={`${item.type}-${index}`} className="rounded-md border bg-zinc-50 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{item.type}</p>
                          <Badge variant={item.severity === "HIGH" ? "destructive" : "warning"}>
                            {item.severity}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t("adminDashboard.severityCount", {
                            severity: item.severity,
                            count: item.count
                          })}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedDetails && (
        <AdminCredenciadoDetails
          credenciado={selectedDetails}
          historyEvents={selectedEvents}
          onClose={onCloseDetails}
          onSave={onSaveDetails}
          onSoftDelete={onSoftDeleteDetails}
          onCredentialStatusChange={onCredentialStatusChange}
          onReissue={onReissueCredential}
        />
      )}

      {!isGovernanceProfile && showGovernanceForm && (
        <AdminComissaoForm
          loading={creatingGovernanceMember}
          error={createGovernanceError}
          onClose={() => setShowGovernanceForm(false)}
          onCreate={async (payload) => {
            await onCreateGovernanceMember(payload);
            setShowGovernanceForm(false);
          }}
        />
      )}
    </main>
  );
}
