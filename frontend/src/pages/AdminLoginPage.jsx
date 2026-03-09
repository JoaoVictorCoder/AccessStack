import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInAdmin } from "../api/platformApi";
import AdminLoginForm from "../components/AdminLoginForm";
import { Card, CardContent } from "../components/ui/card";
import { t } from "../locales";

function AuthHero({ title, subtitle }) {
  return (
    <Card className="border-zinc-200 bg-zinc-900 text-zinc-50">
      <CardContent className="space-y-3 p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">AcessStack</p>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">{title}</h2>
        <p className="max-w-md text-sm text-zinc-300">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminLoginPage({ onLoggedIn }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <main className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(380px,460px)]">
      <AuthHero title={t("auth.admin.heroTitle")} subtitle={t("auth.admin.heroSubtitle")} />
      <AdminLoginForm
        loading={loading}
        error={error}
        title={t("auth.admin.title")}
        subtitle={t("auth.admin.subtitle")}
        onSubmit={async (payload) => {
          setLoading(true);
          setError("");
          try {
            const data = await signInAdmin(payload);
            if (data.admin?.role === "OPERADOR_QR") {
              throw new Error(t("auth.admin.operatorProfileError"));
            }
            onLoggedIn(data.admin);
            navigate("/admin");
          } catch (loginError) {
            setError(loginError.message || t("auth.admin.fallbackError"));
          } finally {
            setLoading(false);
          }
        }}
      />
    </main>
  );
}
