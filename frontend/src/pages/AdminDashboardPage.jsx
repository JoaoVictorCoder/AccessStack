import { useEffect, useState } from "react";
import {
  createAdminComissao,
  createAdminUser,
  exportAdminBackup,
  getAdminAccessLogs,
  getAdminStandVisitorsReport,
  getAdminAnalyticsDescarbonizacao,
  getAdminAnalyticsFraud,
  getAdminAnalyticsOverview,
  getAdminAuditLogs,
  getAdminBackupStatus,
  getAdminCredenciadoById,
  getAdminCredenciadoEventos,
  getAdminCredenciados,
  getAdminEventos,
  getAdminUsers,
  patchAdminCredencialStatus,
  patchAdminUserActive,
  patchAdminUserPermissions,
  reissueAdminCredencial,
  softDeleteAdminCredenciado,
  updateAdminCredenciado,
  updateAdminUser,
  validateAdminCheckIn
} from "../api/credenciamentoApi";
import AdminDashboard from "../components/AdminDashboard";
import InternalUsersPanel from "../components/InternalUsersPanel";

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

const initialStandReportFilters = {
  standId: "",
  operatorId: "",
  comissaoResponsavelId: "",
  empresaVinculadaId: "",
  dateFrom: "",
  dateTo: "",
  categoria: ""
};

function AccessLogsSection({ accessLogFilters, internalUsers, accessLogs, onChangeFilter, onApply }) {
  return (
    <section className="card">
      <h3>Logs de Entrada</h3>
      <div className="grid">
        <label>
          Operador
          <select
            value={accessLogFilters.operatorId}
            onChange={(event) => onChangeFilter("operatorId", event.target.value)}
          >
            <option value="">Todos</option>
            {internalUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.nome}
              </option>
            ))}
          </select>
        </label>
        <label>
          Comissao
          <input
            value={accessLogFilters.comissaoResponsavelId}
            onChange={(event) => onChangeFilter("comissaoResponsavelId", event.target.value)}
          />
        </label>
        <label>
          Stand ID
          <input value={accessLogFilters.standId} onChange={(event) => onChangeFilter("standId", event.target.value)} />
        </label>
        <label>
          Empresa ID
          <input
            value={accessLogFilters.empresaVinculadaId}
            onChange={(event) => onChangeFilter("empresaVinculadaId", event.target.value)}
          />
        </label>
        <label>
          Data inicial
          <input type="datetime-local" value={accessLogFilters.dateFrom} onChange={(event) => onChangeFilter("dateFrom", event.target.value)} />
        </label>
        <label>
          Data final
          <input type="datetime-local" value={accessLogFilters.dateTo} onChange={(event) => onChangeFilter("dateTo", event.target.value)} />
        </label>
        <label>
          Categoria
          <input value={accessLogFilters.categoria} onChange={(event) => onChangeFilter("categoria", event.target.value)} />
        </label>
        <label>
          Resultado
          <select value={accessLogFilters.resultado} onChange={(event) => onChangeFilter("resultado", event.target.value)}>
            <option value="">Todos</option>
            <option value="ALLOW">ALLOW</option>
            <option value="DENY">DENY</option>
          </select>
        </label>
      </div>
      <div className="toolbar">
        <button type="button" onClick={onApply}>
          Aplicar filtros
        </button>
      </div>
      <ul className="event-list compact">
        {accessLogs.map((item) => (
          <li key={item.id} className="event-item">
            <strong>
              {item.resultado} - {item.motivo}
            </strong>
            <span>
              {item.nomeCredenciado || "Sem vinculo"} | Operador: {item.operatorNome || "-"} ({item.operatorEmail || "-"})
            </span>
            <small>
              Stand: {item.standName || "-"} ({item.standId || "-"}) | Empresa: {item.empresaVinculadaNome || item.empresaNome || "-"} | Comissao:{" "}
              {item.comissaoResponsavelNome || item.comissaoResponsavelId || "-"}
            </small>
            <small>{new Date(item.createdAt).toLocaleString("pt-BR")}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StandVisitorsSection({
  standReportFilters,
  internalUsers,
  standReport,
  onChangeFilter,
  onApply
}) {
  return (
    <section className="card">
      <h3>Relatorio de Visitantes por Stand</h3>
      <div className="grid">
        <label>
          Stand ID
          <input value={standReportFilters.standId} onChange={(event) => onChangeFilter("standId", event.target.value)} />
        </label>
        <label>
          Operador
          <select value={standReportFilters.operatorId} onChange={(event) => onChangeFilter("operatorId", event.target.value)}>
            <option value="">Todos</option>
            {internalUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.nome}
              </option>
            ))}
          </select>
        </label>
        <label>
          Comissao
          <input
            value={standReportFilters.comissaoResponsavelId}
            onChange={(event) => onChangeFilter("comissaoResponsavelId", event.target.value)}
          />
        </label>
        <label>
          Empresa ID
          <input
            value={standReportFilters.empresaVinculadaId}
            onChange={(event) => onChangeFilter("empresaVinculadaId", event.target.value)}
          />
        </label>
        <label>
          Data inicial
          <input type="datetime-local" value={standReportFilters.dateFrom} onChange={(event) => onChangeFilter("dateFrom", event.target.value)} />
        </label>
        <label>
          Data final
          <input type="datetime-local" value={standReportFilters.dateTo} onChange={(event) => onChangeFilter("dateTo", event.target.value)} />
        </label>
        <label>
          Categoria
          <input value={standReportFilters.categoria} onChange={(event) => onChangeFilter("categoria", event.target.value)} />
        </label>
      </div>
      <div className="toolbar">
        <button type="button" onClick={onApply}>
          Atualizar relatorio
        </button>
      </div>
      <ul className="event-list compact">
        {standReport.map((item) => (
          <li key={item.accessAttemptId} className="event-item">
            <strong>
              {item.visitor?.nomeCompleto || "-"} | {item.visitor?.categoria || "-"}
            </strong>
            <span>
              Stand: {item.standName || "-"} ({item.standId || "-"}) | Empresa: {item.empresaVinculadaNome || item.empresaNome || "-"}
            </span>
            <small>
              Contato: {item.visitor?.email || "-"} | {item.visitor?.celular || "-"} | LGPD compartilhamento:{" "}
              {item.visitor?.aceitouCompartilhamentoComExpositores ? "sim" : "nao"}
            </small>
            <small>{new Date(item.createdAt).toLocaleString("pt-BR")}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BackupSection({ backupStatus, onGenerate }) {
  return (
    <section className="card">
      <h3>Backup / Continuidade</h3>
      <p>Diretorio: {backupStatus?.backupDir || "-"}</p>
      <p>Total de arquivos: {backupStatus?.totalFiles ?? 0}</p>
      <p>Ultimo backup: {backupStatus?.latestFile || "nenhum"}</p>
      <button type="button" onClick={onGenerate}>
        Gerar backup agora
      </button>
    </section>
  );
}

export default function AdminDashboardPage({ admin, onLogout }) {
  const [listResponse, setListResponse] = useState(emptyListResponse);
  const [eventos, setEventos] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [analyticsOverview, setAnalyticsOverview] = useState(null);
  const [analyticsFraud, setAnalyticsFraud] = useState([]);
  const [analyticsDescarbonizacao, setAnalyticsDescarbonizacao] = useState(null);
  const [checkInResult, setCheckInResult] = useState(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [creatingComissao, setCreatingComissao] = useState(false);
  const [createComissaoError, setCreateComissaoError] = useState("");
  const [internalUsers, setInternalUsers] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [backupStatus, setBackupStatus] = useState(null);
  const [accessLogFilters, setAccessLogFilters] = useState(initialAccessLogFilters);
  const [standReportFilters, setStandReportFilters] = useState(initialStandReportFilters);
  const [standReport, setStandReport] = useState([]);

  async function loadData(activeFilters = filters) {
    setLoading(true);
    setError("");

    try {
      if (admin?.role === "COMISSAO_ORGANIZADORA") {
        const [usersData, accessLogsData, reportData] = await Promise.all([
          getAdminUsers(),
          getAdminAccessLogs({ page: 1, pageSize: 30, ...accessLogFilters }),
          getAdminStandVisitorsReport(standReportFilters)
        ]);

        setInternalUsers(usersData.items || []);
        setAccessLogs(accessLogsData.items || []);
        setStandReport(reportData.items || []);
        setListResponse(emptyRestrictedListResponse);
        setEventos([]);
        setAuditLogs([]);
        setAnalyticsOverview(null);
        setAnalyticsFraud([]);
        setAnalyticsDescarbonizacao(null);
        setBackupStatus(null);
        return;
      }

      const [listData, eventData, logData, overview, fraud, descarbonizacao] = await Promise.all([
        getAdminCredenciados(activeFilters),
        getAdminEventos({ limit: 60 }),
        getAdminAuditLogs({ page: 1, pageSize: 40 }),
        getAdminAnalyticsOverview(),
        getAdminAnalyticsFraud(),
        getAdminAnalyticsDescarbonizacao()
      ]);

      setListResponse(listData);
      setEventos(eventData);
      setAuditLogs(logData.items || []);
      setAnalyticsOverview(overview);
      setAnalyticsFraud(fraud);
      setAnalyticsDescarbonizacao(descarbonizacao);

      if (admin?.role === "MASTER_ADMIN") {
        const [usersData, accessLogsData, backupData, reportData] = await Promise.all([
          getAdminUsers(),
          getAdminAccessLogs({ page: 1, pageSize: 30, ...accessLogFilters }),
          getAdminBackupStatus(),
          getAdminStandVisitorsReport(standReportFilters)
        ]);

        setInternalUsers(usersData.items || []);
        setAccessLogs(accessLogsData.items || []);
        setBackupStatus(backupData);
        setStandReport(reportData.items || []);
      } else {
        setInternalUsers([]);
        setAccessLogs([]);
        setStandReport([]);
        setBackupStatus(null);
      }
    } catch (loadError) {
      setError(loadError.message || "Falha ao carregar dados administrativos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(filters);
  }, [filters.page, filters.pageSize, filters.categoria]);

  function changeAccessLogFilter(field, value) {
    setAccessLogFilters((prev) => ({ ...prev, [field]: value }));
  }

  function changeStandReportFilter(field, value) {
    setStandReportFilters((prev) => ({ ...prev, [field]: value }));
  }

  async function refreshSelectedDetails() {
    if (!selectedDetails?.id) return;
    const refreshed = await getAdminCredenciadoById(selectedDetails.id);
    setSelectedDetails(refreshed);
  }

  return (
    <main className="single-page">
      <AdminDashboard
        admin={admin}
        listResponse={listResponse}
        eventos={eventos}
        loading={loading}
        error={error}
        filters={filters}
        onChangeFilters={(next) => {
          setFilters(next);
          if (next.search !== filters.search) {
            loadData(next);
          }
        }}
        onReload={() => loadData(filters)}
        onOpenDetails={async (id) => {
          try {
            const [identity, eventsData] = await Promise.all([
              getAdminCredenciadoById(id),
              getAdminCredenciadoEventos(id)
            ]);
            setSelectedDetails(identity);
            setSelectedEvents(eventsData);
          } catch (detailError) {
            setError(detailError.message || "Falha ao carregar detalhes.");
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
          await updateAdminCredenciado(selectedDetails.id, payload);
          await refreshSelectedDetails();
          await loadData(filters);
        }}
        onSoftDeleteDetails={async () => {
          if (!selectedDetails?.id) return;
          await softDeleteAdminCredenciado(selectedDetails.id, "inativacao manual");
          await refreshSelectedDetails();
          await loadData(filters);
        }}
        onCredentialStatusChange={async (statusCredencial) => {
          if (!selectedDetails?.credencial?.id) return;
          await patchAdminCredencialStatus(selectedDetails.credencial.id, {
            statusCredencial,
            motivo: "acao manual no painel admin"
          });
          await refreshSelectedDetails();
          await loadData(filters);
        }}
        onReissueCredential={async () => {
          if (!selectedDetails?.credencial?.id) return;
          await reissueAdminCredencial(selectedDetails.credencial.id, {
            motivo: "reemissao manual no painel admin"
          });
          await refreshSelectedDetails();
          await loadData(filters);
        }}
        onCreateComissao={async (payload) => {
          setCreatingComissao(true);
          setCreateComissaoError("");
          try {
            await createAdminComissao(payload);
            await loadData(filters);
          } catch (createError) {
            setCreateComissaoError(createError.message || "Erro ao criar membro.");
            throw createError;
          } finally {
            setCreatingComissao(false);
          }
        }}
        creatingComissao={creatingComissao}
        createComissaoError={createComissaoError}
        onLogout={onLogout}
        auditLogs={auditLogs}
        onRunCheckIn={async (payload) => {
          setCheckInLoading(true);
          setError("");
          try {
            const result = await validateAdminCheckIn(payload);
            setCheckInResult(result);
            await loadData(filters);
          } catch (checkError) {
            setError(checkError.message || "Falha no check-in.");
          } finally {
            setCheckInLoading(false);
          }
        }}
        checkInResult={checkInResult}
        checkInLoading={checkInLoading}
        analyticsOverview={analyticsOverview}
        analyticsFraud={analyticsFraud}
        analyticsDescarbonizacao={analyticsDescarbonizacao}
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
            onToggleActive={async (id, ativo) => {
              await patchAdminUserActive(id, ativo);
              await loadData(filters);
            }}
            onUpdatePermissions={async (id, permissions) => {
              await patchAdminUserPermissions(id, permissions);
              await loadData(filters);
            }}
            onUpdateUser={async (id, payload) => {
              await updateAdminUser(id, payload);
              await loadData(filters);
            }}
          />

          <AccessLogsSection
            accessLogFilters={accessLogFilters}
            internalUsers={internalUsers}
            accessLogs={accessLogs}
            onChangeFilter={changeAccessLogFilter}
            onApply={() => loadData(filters)}
          />

          <StandVisitorsSection
            standReportFilters={standReportFilters}
            internalUsers={internalUsers}
            standReport={standReport}
            onChangeFilter={changeStandReportFilter}
            onApply={() => loadData(filters)}
          />

          {admin?.role === "MASTER_ADMIN" && (
            <BackupSection
              backupStatus={backupStatus}
              onGenerate={async () => {
                await exportAdminBackup();
                await loadData(filters);
              }}
            />
          )}
        </>
      )}
    </main>
  );
}
