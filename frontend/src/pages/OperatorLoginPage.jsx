import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInOperator } from "../api/platformApi";
import AdminLoginForm from "../components/AdminLoginForm";
import { Card, CardContent } from "../components/ui/card";
import { t } from "../locales";

function OperatorHero() {
  return (
    <Card className="border-zinc-200 bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-50">
      <CardContent className="space-y-3 p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">AcessStack</p>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">{t("auth.operator.heroTitle")}</h2>
        <p className="max-w-md text-sm text-zinc-300">{t("auth.operator.heroSubtitle")}</p>
      </CardContent>
    </Card>
  );
}

export default function OperatorLoginPage({ onLoggedIn }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <main className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(380px,460px)]">
      <OperatorHero />
      <AdminLoginForm
        loading={loading}
        error={error}
        title={t("auth.operator.title")}
        subtitle={t("auth.operator.subtitle")}
        onSubmit={async (payload) => {
          setLoading(true);
          setError("");
          try {
            const data = await signInOperator(payload);
            onLoggedIn(data.admin);
            navigate("/operator");
          } catch (loginError) {
            setError(loginError.message || t("auth.operator.fallbackError"));
          } finally {
            setLoading(false);
          }
        }}
      />
    </main>
  );
}
