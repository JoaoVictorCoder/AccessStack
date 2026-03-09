import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { operatorLogin } from "../api/credenciamentoApi";
import AdminLoginForm from "../components/AdminLoginForm";

export default function OperatorLoginPage({ onLoggedIn }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <main className="auth-layout">
      <section className="auth-hero card">
        <h2>Operacao de Entrada</h2>
        <p>Login exclusivo para leitura e validacao de QR em campo.</p>
      </section>
      <AdminLoginForm
        loading={loading}
        error={error}
        title="Entrar como Operador"
        subtitle="Acesso mobile para controle de entrada."
        onSubmit={async (payload) => {
          setLoading(true);
          setError("");
          try {
            const data = await operatorLogin(payload);
            onLoggedIn(data.admin);
            navigate("/operator");
          } catch (loginError) {
            setError(loginError.message || "Falha no login do operador.");
          } finally {
            setLoading(false);
          }
        }}
      />
    </main>
  );
}
