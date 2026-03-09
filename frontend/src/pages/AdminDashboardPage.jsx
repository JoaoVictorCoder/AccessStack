import { useEffect, useState } from "react";
import {
  createAdminGovernanceParticipant,
  createAdminUser,
  deactivateAdminParticipant,
  getAdminAnalyticsFraud,
  getAdminAnalyticsOverview,
  getAdminBackupStatus,
  getAdminParticipantById,
  listAdminAccessLogs,
  listAdminAuditLogs,
  listAdminParticipantEvents,
  listAdminParticipants,
  listAdminSystemEvents,
  listAdminUnitVisitorsReport,
  listAdminUsers,
  reissueAdminCredential,
  runAdminBackupExport,
  runAdminCheckInValidation,
  updateAdminCredentialStatus,
  updateAdminParticipant,
  updateAdminUser,
  updateAdminUserActive,
  updateAdminUserPermissions
} from "../api/platformApi";
import AdminDashboard from "../components/AdminDashboard";
import InternalUsersPanel from "../components/InternalUsersPanel";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select } from "../components/ui/select";
import { t } from "../locales";

const emptyListResponse = { items: [], page: 1, totalPages: 1 };
const emptyRestrictedListResponse = { items: [], page: 1, totalPages: 1, total: 0 };

const initialFilters = {
  search: "",
  categoria: "",
  page: 1,
  pageSize: 10
};

const initialAccessLogFilters = {
  operatorId: "",
  comissaoResponsavelId: "",
  standId: "",
  empresaVinculadaId: "",
  dateFrom: "",
  dateTo: "",
  categoria: "",
  resultado: ""
};

const initialUnitReportFilters = {
  standId: "",
  operatorId: "",
  comissaoResponsavelId: "",
  empresaVinculadaId: "",
  dateFrom: "",
  dateTo: "",
  categoria: ""
};

function AccessLogsSection({ filters, internalUsers, accessLogs, onChangeFilter, onApply }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("adminLists.accessLogsTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="field-stack">
            <Label>{t("adminLists.operator")}</Label>
            <Select value={filters.operatorId} onChange={(event) => onChangeFilter("operatorId", event.target.value)}>
              <option value="">{t("common.unrestricted")}</option>
              {internalUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nome}
                </option>
              ))}
            </Select>
          </div>
          <div className="field-stack">
            <Label>{t("adminLists.governanceId")}</Label>
            <Input
              value={filters.comissaoResponsavelId}
              onChange={(event) => onChangeFilter("comissaoResponsavelId", event.target.value)}
            />
          </div>
          <div className="field-stack">
            <Label>{t("adminLists.unitId")}</Label>
            <Input value={filters.standId} onChange={(event) => onChangeFilter("standId", event.target.value)} />
          </div>
          <div className="field-stack">
            <Label>{t("adminLists.organizationId")}</Label>
            <Input
              value={filters.empresaVinculadaId}
              onChange={(event) => onChangeFilter("empresaVinculadaId", event.target.value)}
            />
          </div>
          <div className="field-stack">
            <Label>{t("adminLists.startDate")}</Label>
            <Input
              type="datetime-local"
              value={filters.dateFrom}
              onChange={(event) => onChangeFilter("dateFrom", event.target.value)}
            />
          </div>
          <div className="field-stack">
            <Label>{t("adminLists.endDate")}</Label>
            <Input
              type="datetime-local"
              value={filters.dateTo}
              onChange={(event) => onChangeFilter("dateTo", event.target.value)}
            />
          </div>
          <div className="field-stack">
            <Label>{t("table.category")}</Label>
            <Input value={filters.categoria} onChange={(event) => onChangeFilter("categoria", event.target.value)} />
          </div>
          <div className="field-stack">
            <Label>{t("adminLists.result")}</Label>
            <Select value={filters.resultado} onChange={(event) => onChangeFilter("resultado", event.target.value)}>
              <option value="">{t("common.unrestricted")}</option>
              <option value="ALLOW">ALLOW</option>
              <option value="DENY">DENY</option>
            </Select>
          </div>
        </div>
        <Button type="button" variant="secondary" onClick={onApply}>
          {t("adminLists.applyFilters")}
        </Button>
        <ul className="max-h-[300px] space-y-2 overflow-auto">
          {accessLogs.map((item) => (
            <li key={item.id} className="rounded-md border bg-zinc-50 p-3">
              <p className="text-sm font-medium">
                {item.resultado} - {item.motivo}
              </p>
              <p className="text-sm text-muted-foreground">
                {item.nomeCredenciado || t("adminDashboard.noLinkedParticipant")} | {t("adminLists.operator")}:{" "}
                {item.operatorNome || "-"} ({item.operatorEmail || "-"})
              </p>
              <p className="text-xs text-muted-foreground">
                {t("adminLists.unit")}: {item.standName || "-"} ({item.standId || "-"}) | {t("adminLists.organization")}:{" "}
                {item.empresaVinculadaNome || item.empresaNome || "-"} | {t("adminLists.governance")}:{" "}
                {item.comissaoResponsavelNome || item.comissaoResponsavelId || "-"}
              </p>
              <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function UnitVisitorsSection({ filters, internalUsers, reportItems, onChangeFilter, onApply }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("adminLists.visitorsByUnitTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="field-stack">
            <Label>{t("adminLists.unitId")}</Label>
            <Input value={filters.standId} onChange={(event) => onChangeFilter("standId", event.target.value)} />
          </div>
          <div className="field-stack">
            <Label>{t("adminLists.operator")}</Label>
            <Select value={filters.operatorId} onChange={(event) => onChangeFilter("operatorId", event.target.value)}>
              <option value="">{t("common.unrestricted")}</option>
              {internalUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nome}
                </option>
              ))}
            </Select>
          </div>
          <div className="field-stack">
            <Label>{t("adminLists.governanceId")}</Label>
            <Input
              value={filters.comissaoResponsavelId}
              onChange={(event) => onChangeFilter("comissaoResponsavelId", event.target.value)}
            />
          </div>
          <div className="field-stack">
            <Label>{t("adminLists.organizationId")}</Label>
            <Input
              value={filters.empresaVinculadaId}
              onChange={(event) => onChangeFilter("empresaVinculadaId", event.target.value)}
            />
          </div>
          <div className="field-stack">
            <Label>{t("adminLists.startDate")}</Label>
            <Input
              type="datetime-local"
              value={filters.dateFrom}
              onChange={(event) => onChangeFilter("dateFrom", event.target.value)}
            />
          </div>
          <div className="field-stack">
            <Label>{t("adminLists.endDate")}</Label>
            <Input
              type="datetime-local"
              value={filters.dateTo}
              onChange={(event) => onChangeFilter("dateTo", event.target.value)}
            />
          </div>
          <div className="field-stack">
            <Label>{t("table.category")}</Label>
            <Input value={filters.categoria} onChange={(event) => onChangeFilter("categoria", event.target.value)} />
          </div>
        </div>
        <Button type="button" variant="secondary" onClick={onApply}>
          {t("adminLists.updateReport")}
        </Button>
        <ul className="max-h-[280px] space-y-2 overflow-auto">
          {reportItems.map((item) => (
            <li key={item.accessAttemptId} className="rounded-md border bg-zinc-50 p-3">
              <p className="text-sm font-medium">
                {item.visitor?.nomeCompleto || "-"} | {item.visitor?.categoria || "-"}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("adminLists.unit")}: {item.standName || "-"} ({item.standId || "-"}) | {t("adminLists.organization")}:{" "}
                {item.empresaVinculadaNome || item.empresaNome || "-"}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("adminLists.contact")}: {item.visitor?.email || "-"} | {item.visitor?.celular || "-"} |{" "}
                {t("adminLists.sharingConsent")}:{" "}
                {item.visitor?.aceitouCompartilhamentoComExpositores ? t("common.yes") : t("common.no")}
              </p>
              <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function BackupSection({ backupStatus, onGenerate }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("adminLists.backupTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {t("adminLists.backupDirectory", { value: backupStatus?.backupDir || "-" })}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("adminLists.backupTotalFiles", { value: backupStatus?.totalFiles ?? 0 })}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("adminLists.backupLatest", { value: backupStatus?.latestFile || t("common.none") })}
        </p>
        <Button type="button" onClick={onGenerate}>
          {t("adminLists.generateBackup")}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage({ admin, onLogout }) {
  const [listResponse, setListResponse] = useState(emptyListResponse);
  const [systemEvents, setSystemEvents] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [analyticsOverview, setAnalyticsOverview] = useState(null);
  const [analyticsFraud, setAnalyticsFraud] = useState([]);
  const [checkInResult, setCheckInResult] = useState(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [isCreatingGovernance, setIsCreatingGovernance] = useState(false);
  const [createGovernanceError, setCreateGovernanceError] = useState("");
  const [internalUsers, setInternalUsers] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [backupStatus, setBackupStatus] = useState(null);
  const [accessLogFilters, setAccessLogFilters] = useState(initialAccessLogFilters);
  const [unitReportFilters, setUnitReportFilters] = useState(initialUnitReportFilters);
  const [unitVisitorsReport, setUnitVisitorsReport] = useState([]);

  async function loadData(activeFilters = filters) {
    setIsLoading(true);
    setErrorMessage("");

    try {
      if (admin?.role === "COMISSAO_ORGANIZADORA") {
        const [usersData, accessLogsData, reportData] = await Promise.all([
          listAdminUsers(),
          listAdminAccessLogs({ page: 1, pageSize: 30, ...accessLogFilters }),
          listAdminUnitVisitorsReport(unitReportFilters)
        ]);

        setInternalUsers(usersData.items || []);
        setAccessLogs(accessLogsData.items || []);
        setUnitVisitorsReport(reportData.items || []);
        setListResponse(emptyRestrictedListResponse);
        setSystemEvents([]);
        setAuditLogs([]);
        setAnalyticsOverview(null);
        setAnalyticsFraud([]);
        setBackupStatus(null);
        return;
      }

      const [participantsData, eventsData, logsData, overviewData, fraudData] = await Promise.all([
        listAdminParticipants({
          ...activeFilters,
          category: activeFilters.categoria
        }),
        listAdminSystemEvents({ limit: 60 }),
        listAdminAuditLogs({ page: 1, pageSize: 40 }),
        getAdminAnalyticsOverview(),
        getAdminAnalyticsFraud()
      ]);

      setListResponse(participantsData);
      setSystemEvents(eventsData);
      setAuditLogs(logsData.items || []);
      setAnalyticsOverview(overviewData);
      setAnalyticsFraud(fraudData);

      if (admin?.role === "MASTER_ADMIN") {
        const [usersData, accessLogsData, backupData, reportData] = await Promise.all([
          listAdminUsers(),
          listAdminAccessLogs({ page: 1, pageSize: 30, ...accessLogFilters }),
          getAdminBackupStatus(),
          listAdminUnitVisitorsReport(unitReportFilters)
        ]);

        setInternalUsers(usersData.items || []);
        setAccessLogs(accessLogsData.items || []);
        setBackupStatus(backupData);
        setUnitVisitorsReport(reportData.items || []);
      } else {
        setInternalUsers([]);
        setAccessLogs([]);
        setUnitVisitorsReport([]);
        setBackupStatus(null);
      }
    } catch (loadError) {
      setErrorMessage(loadError.message || t("errors.adminDataLoad"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData(filters);
  }, [filters.page, filters.pageSize, filters.categoria]);

  function changeAccessLogFilter(field, value) {
    setAccessLogFilters((currentFilters) => ({ ...currentFilters, [field]: value }));
  }

  function changeUnitReportFilter(field, value) {
    setUnitReportFilters((currentFilters) => ({ ...currentFilters, [field]: value }));
  }

  async function refreshSelectedDetails() {
    if (!selectedDetails?.id) return;
    const refreshed = await getAdminParticipantById(selectedDetails.id);
    setSelectedDetails(refreshed);
  }

  return (
    <main className="space-y-4">
      <AdminDashboard
        admin={admin}
        listResponse={listResponse}
        systemEvents={systemEvents}
        loading={isLoading}
        error={errorMessage}
        filters={filters}
        onChangeFilters={(nextFilters) => {
          setFilters(nextFilters);
          if (nextFilters.search !== filters.search) loadData(nextFilters);
        }}
        onReload={() => loadData(filters)}
        onOpenDetails={async (participantId) => {
          try {
            const [identity, eventsData] = await Promise.all([
              getAdminParticipantById(participantId),
              listAdminParticipantEvents(participantId)
            ]);
            setSelectedDetails(identity);
            setSelectedEvents(eventsData);
          } catch (detailError) {
            setErrorMessage(detailError.message || t("errors.detailsLoad"));
          }
        }}
        selectedDetails={selectedDetails}
        selectedEvents={selectedEvents}
        onCloseDetails={() => {
          setSelectedDetails(null);
          setSelectedEvents([]);
        }}
        onSaveDetails={async (payload) => {
          if (!selectedDetails?.id) return;
          await updateAdminParticipant(selectedDetails.id, payload);
          await refreshSelectedDetails();
          await loadData(filters);
        }}
        onSoftDeleteDetails={async () => {
          if (!selectedDetails?.id) return;
          await deactivateAdminParticipant(selectedDetails.id, "manual deactivation");
          await refreshSelectedDetails();
          await loadData(filters);
        }}
        onCredentialStatusChange={async (statusCredencial) => {
          if (!selectedDetails?.credencial?.id) return;
          await updateAdminCredentialStatus(selectedDetails.credencial.id, {
            statusCredencial,
            motivo: "manual admin action"
          });
          await refreshSelectedDetails();
          await loadData(filters);
        }}
        onReissueCredential={async () => {
          if (!selectedDetails?.credencial?.id) return;
          await reissueAdminCredential(selectedDetails.credencial.id, {
            motivo: "manual admin reissue"
          });
          await refreshSelectedDetails();
          await loadData(filters);
        }}
        onCreateGovernanceMember={async (payload) => {
          setIsCreatingGovernance(true);
          setCreateGovernanceError("");
          try {
            await createAdminGovernanceParticipant(payload);
            await loadData(filters);
          } catch (createError) {
            setCreateGovernanceError(createError.message || t("errors.governanceCreate"));
            throw createError;
          } finally {
            setIsCreatingGovernance(false);
          }
        }}
        creatingGovernanceMember={isCreatingGovernance}
        createGovernanceError={createGovernanceError}
        onLogout={onLogout}
        auditLogs={auditLogs}
        onRunCheckIn={async (payload) => {
          setCheckInLoading(true);
          setErrorMessage("");
          try {
            const result = await runAdminCheckInValidation(payload);
            setCheckInResult(result);
            await loadData(filters);
          } catch (checkError) {
            setErrorMessage(checkError.message || t("errors.checkIn"));
          } finally {
            setCheckInLoading(false);
          }
        }}
        checkInResult={checkInResult}
        checkInLoading={checkInLoading}
        analyticsOverview={analyticsOverview}
        analyticsFraud={analyticsFraud}
      />

      {(admin?.role === "MASTER_ADMIN" || admin?.role === "COMISSAO_ORGANIZADORA") && (
        <>
          <InternalUsersPanel
            managerRole={admin?.role}
            users={internalUsers}
            currentUserId={admin?.id}
            onCreate={async (payload) => {
              await createAdminUser(payload);
              await loadData(filters);
            }}
            onToggleActive={async (userId, isActive) => {
              await updateAdminUserActive(userId, isActive);
              await loadData(filters);
            }}
            onUpdatePermissions={async (userId, permissions) => {
              await updateAdminUserPermissions(userId, permissions);
              await loadData(filters);
            }}
            onUpdateUser={async (userId, payload) => {
              await updateAdminUser(userId, payload);
              await loadData(filters);
            }}
          />

          <AccessLogsSection
            filters={accessLogFilters}
            internalUsers={internalUsers}
            accessLogs={accessLogs}
            onChangeFilter={changeAccessLogFilter}
            onApply={() => loadData(filters)}
          />

          <UnitVisitorsSection
            filters={unitReportFilters}
            internalUsers={internalUsers}
            reportItems={unitVisitorsReport}
            onChangeFilter={changeUnitReportFilter}
            onApply={() => loadData(filters)}
          />

          {admin?.role === "MASTER_ADMIN" && (
            <BackupSection
              backupStatus={backupStatus}
              onGenerate={async () => {
                await runAdminBackupExport();
                await loadData(filters);
              }}
            />
          )}
        </>
      )}
    </main>
  );
}
