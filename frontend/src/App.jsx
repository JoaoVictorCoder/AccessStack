import { useEffect, useState } from "react";
import { Navigate, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  createAdminComissao,
  createCredenciadoPublic,
  getAdminAnalyticsFraud,
  getAdminAnalyticsOverview,
  getAdminAuditLogs,
  getAdminCredenciadoById,
  getAdminCredenciadoEventos,
  getAdminCredenciados,
  getAdminCredencialById,
  getAdminEventos,
  getPublicCredenciadoStatus,
  getPublicCredencialPdfUrl,
  getPublicCredencialQr,
  login,
  logout,
  me,
  validateAdminCheckIn
} from "./api/credenciamentoApi";
import AdminCredencialView from "./components/AdminCredencialView";
import AdminDashboard from "./components/AdminDashboard";
import AdminLoginForm from "./components/AdminLoginForm";
import CredenciadoForm from "./components/CredenciadoForm";
import { baseForm } from "./constants/formConfig";

function PublicAreaPage() {
  const [form, setForm] = useState(baseForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastCreated, setLastCreated] = useState(null);
  const [statusId, setStatusId] = useState("");
  const [statusData, setStatusData] = useState(null);
  const [statusError, setStatusError] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");

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
    setSuccess("");
    setSaving(true);

    try {
      const created = await createCredenciadoPublic(form);
      setLastCreated(created);
      setSuccess(
        `Cadastro realizado com sucesso. Credencial ${created.credencial?.codigoUnico || "N/A"} gerada.`
      );
      setForm((prev) => ({ ...baseForm, categoria: prev.categoria }));
    } catch (submitError) {
      setError(submitError.message || "Erro ao cadastrar.");
    } finally {
      setSaving(false);
    }
  }

  async function fetchStatus(event) {
    event.preventDefault();
    setStatusError("");
    setStatusData(null);
    setQrDataUrl("");
    try {
      const data = await getPublicCredenciadoStatus(statusId);
      setStatusData(data);
      if (data.credencial?.id) {
        const qr = await getPublicCredencialQr(data.credencial.id);
        setQrDataUrl(qr.qrcode || "");
      }
    } catch (loadError) {
      setStatusError(loadError.message || "Falha ao consultar status.");
    }
  }

  return (
    <main className="single-page">
      <section className="card">
        <h2>Cadastro Publico</h2>
        <p>Preencha seus dados para credenciamento no evento.</p>
        <CredenciadoForm form={form} saving={saving} onChange={onChange} onSubmit={onSubmit} />
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        {lastCreated?.id && <p>ID do cadastro: {lastCreated.id}</p>}
      </section>

      <section className="card">
        <h2>Consulta publica de status</h2>
        <form className="grid single-column" onSubmit={fetchStatus}>
          <label>
            ID do credenciado
            <input
              value={statusId}
              onChange={(event) => setStatusId(event.target.value)}
              required
            />
          </label>
          <button type="submit">Consultar status</button>
        </form>

        {statusError && <p className="error">{statusError}</p>}
        {statusData && (
          <div className="details-grid">
            <div className="detail-field">
              <span>Status credenciamento</span>
              <strong>{statusData.statusCredenciamento}</strong>
            </div>
            <div className="detail-field">
              <span>Status credencial</span>
              <strong>{statusData.credencial?.statusCredencial || "-"}</strong>
            </div>
            <div className="detail-field">
              <span>Codigo da credencial</span>
              <strong>{statusData.credencial?.codigoUnico || "-"}</strong>
            </div>
            {statusData.credencial?.id && (
              <div className="detail-field">
                <span>PDF da credencial</span>
                <a
                  className="link-button"
                  target="_blank"
                  rel="noreferrer"
                  href={getPublicCredencialPdfUrl(statusData.credencial.id)}
                >
                  Abrir PDF
                </a>
              </div>
            )}
          </div>
        )}

        {qrDataUrl && (
          <div className="qr-section">
            <h3>QR Code</h3>
            <img src={qrDataUrl} alt="QR da credencial" className="qr-image" />
          </div>
        )}
      </section>
    </main>
  );
}

function AdminLoginPage({ onLoggedIn }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <main className="single-page">
      <AdminLoginForm
        loading={loading}
        error={error}
        onSubmit={async (payload) => {
          setLoading(true);
          setError("");
          try {
            const data = await login(payload);
            onLoggedIn(data.admin);
            navigate("/admin");
          } catch (loginError) {
            setError(loginError.message || "Falha no login.");
          } finally {
            setLoading(false);
          }
        }}
      />
    </main>
  );
}

function AdminDashboardPage({ admin, onLogout }) {
  const [listResponse, setListResponse] = useState({ items: [], page: 1, totalPages: 1 });
  const [eventos, setEventos] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [analyticsOverview, setAnalyticsOverview] = useState(null);
  const [analyticsFraud, setAnalyticsFraud] = useState([]);
  const [checkInResult, setCheckInResult] = useState(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    categoria: "",
    page: 1,
    pageSize: 10
  });
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [creatingComissao, setCreatingComissao] = useState(false);
  const [createComissaoError, setCreateComissaoError] = useState("");

  async function loadData(activeFilters = filters) {
    setLoading(true);
    setError("");
    try {
      const [listData, eventData, logData, overview, fraud] = await Promise.all([
        getAdminCredenciados(activeFilters),
        getAdminEventos({ limit: 60 }),
        getAdminAuditLogs({ page: 1, pageSize: 40 }),
        getAdminAnalyticsOverview(),
        getAdminAnalyticsFraud()
      ]);
      setListResponse(listData);
      setEventos(eventData);
      setAuditLogs(logData.items || []);
      setAnalyticsOverview(overview);
      setAnalyticsFraud(fraud);
    } catch (loadError) {
      setError(loadError.message || "Falha ao carregar dados administrativos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(filters);
  }, [filters.page, filters.pageSize, filters.categoria]);

  return (
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
    />
  );
}

function AdminCredencialPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    setLoading(true);
    getAdminCredencialById(id)
      .then((response) => {
        setData(response);
      })
      .catch((loadError) => {
        setError(loadError.message || "Credencial nao encontrada.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  return <AdminCredencialView data={data} loading={loading} error={error} />;
}

function ProtectedAdminRoute({ admin, children }) {
  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function App() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    me()
      .then((response) => {
        setAdmin(response.admin);
      })
      .catch(() => {
        setAdmin(null);
      })
      .finally(() => setCheckingAuth(false));
  }, []);

  if (checkingAuth) {
    return <p className="loading-screen">Carregando...</p>;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Credenciamento - Setor Cafeeiro</h1>
          <p>Checkpoint 2 - Publico + Admin + Check-in + QR/PDF + Analytics</p>
        </div>
        <nav className="tabs">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "tab active" : "tab")}>
            Publico
          </NavLink>
          <NavLink
            to={admin ? "/admin" : "/admin/login"}
            className={({ isActive }) => (isActive ? "tab active" : "tab")}
          >
            Admin
          </NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<PublicAreaPage />} />
        <Route path="/admin/login" element={<AdminLoginPage onLoggedIn={setAdmin} />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute admin={admin}>
              <AdminDashboardPage
                admin={admin}
                onLogout={async () => {
                  await logout();
                  setAdmin(null);
                  navigate("/admin/login");
                }}
              />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/credenciais/:id"
          element={
            <ProtectedAdminRoute admin={admin}>
              <AdminCredencialPage />
            </ProtectedAdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
