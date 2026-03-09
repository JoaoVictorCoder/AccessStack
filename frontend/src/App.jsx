import { useEffect, useState } from "react";
import { Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { getCurrentSession, signOutSession } from "./api/platformApi";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import { Card, CardContent } from "./components/ui/card";
import { cn } from "./lib/utils";
import AdminCredencialPage from "./pages/AdminCredencialPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import OperatorAreaPage from "./pages/OperatorAreaPage";
import OperatorLoginPage from "./pages/OperatorLoginPage";
import PublicAreaPage from "./pages/PublicAreaPage";
import { t } from "./locales";

function TabLink({ to, children, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "inline-flex min-w-[120px] items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )
      }
    >
      {children}
    </NavLink>
  );
}

function AppHeader({ admin, operator, isOperatorSession }) {
  return (
    <Card className="overflow-hidden border-zinc-200 bg-zinc-50/90 backdrop-blur">
      <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("app.brandTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("app.brandSubtitle")}</p>
        </div>
        <nav className="flex flex-wrap gap-2">
          <TabLink to="/" end>
            {t("app.tabs.public")}
          </TabLink>
          {!isOperatorSession && (
            <TabLink to={admin ? "/admin" : "/admin/login"}>{t("app.tabs.admin")}</TabLink>
          )}
          <TabLink to={operator ? "/operator" : "/operator/login"}>
            {t("app.tabs.operator")}
          </TabLink>
        </nav>
      </CardContent>
    </Card>
  );
}

function normalizeSession(response) {
  const role = response.admin?.role;
  if (role === "OPERADOR_QR") {
    return { admin: null, operator: response.admin };
  }
  return { admin: response.admin, operator: null };
}

export default function App() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [operatorUser, setOperatorUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const isOperatorSession = Boolean(operatorUser) && !adminUser;

  useEffect(() => {
    getCurrentSession()
      .then((response) => {
        const session = normalizeSession(response);
        setAdminUser(session.admin);
        setOperatorUser(session.operator);
      })
      .catch(() => {
        setAdminUser(null);
        setOperatorUser(null);
      })
      .finally(() => setIsCheckingSession(false));
  }, []);

  async function handleLogout() {
    await signOutSession();
    setAdminUser(null);
    setOperatorUser(null);
    navigate("/admin/login");
  }

  if (isCheckingSession) {
    return <p className="page-shell py-10 text-sm text-muted-foreground">{t("app.loading")}</p>;
  }

  return (
    <div className="page-shell">
      <AppHeader admin={adminUser} operator={operatorUser} isOperatorSession={isOperatorSession} />
      <div className="section-stack">
        <Routes>
          <Route path="/" element={<PublicAreaPage />} />
          <Route path="/admin/login" element={<AdminLoginPage onLoggedIn={setAdminUser} />} />
          <Route path="/operator/login" element={<OperatorLoginPage onLoggedIn={setOperatorUser} />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute admin={adminUser}>
                <AdminDashboardPage admin={adminUser} onLogout={handleLogout} />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/operator"
            element={
              <ProtectedAdminRoute admin={operatorUser}>
                <OperatorAreaPage operator={operatorUser} />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/credenciais/:id"
            element={
              <ProtectedAdminRoute admin={adminUser}>
                <AdminCredencialPage />
              </ProtectedAdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
