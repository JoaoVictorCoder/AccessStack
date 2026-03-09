import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAdminCredencialById, updateAdminCredencial } from "../api/credenciamentoApi";
import AdminCredencialView from "../components/AdminCredencialView";

export default function AdminCredencialPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);

  async function reload() {
    setLoading(true);
    setError("");
    try {
      const response = await getAdminCredencialById(id);
      setData(response);
    } catch (loadError) {
      setError(loadError.message || "Credencial nao encontrada.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, [id]);

  return (
    <AdminCredencialView
      data={data}
      loading={loading}
      saving={saving}
      error={error}
      onSave={async (payload) => {
        setSaving(true);
        setError("");
        try {
          const updated = await updateAdminCredencial(id, payload);
          setData(updated);
        } catch (saveError) {
          setError(saveError.message || "Falha ao salvar credencial.");
        } finally {
          setSaving(false);
        }
      }}
    />
  );
}
