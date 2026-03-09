import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/credenciamentoApi";
import AdminLoginForm from "../components/AdminLoginForm";

export default function AdminLoginPage({ onLoggedIn }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <main className="auth-layout">
      <section className="auth-hero card">
        <h2>Area Administrativa</h2>
        <p>Acesso seguro para equipe organizadora e operacao do evento.</p>
      </section>
      <AdminLoginForm
        loading={loading}
        error={error}
        title="Entrar no Painel Admin"
        subtitle="Use seu e-mail e senha para continuar."
        onSubmit={async (payload) => {
          setLoading(true);
          setError("");
          try {
            const data = await login(payload);
            if (data.admin?.role === "OPERADOR_QR") {
              throw new Error("Use a aba Operador QR para este perfil");
            }
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
