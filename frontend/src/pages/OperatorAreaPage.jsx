import { useEffect, useState } from "react";
import { operatorHistoryBasic, operatorValidateCheckIn } from "../api/credenciamentoApi";
import OperatorConsole from "../components/OperatorConsole";

export default function OperatorAreaPage({ operator }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    operatorHistoryBasic()
      .then((data) => setHistory(data.items || []))
      .catch(() => setHistory([]));
  }, []);

  return (
    <OperatorConsole
      operator={operator}
      history={history}
      loading={loading}
      onValidate={async (payload) => {
        setLoading(true);
        try {
          const result = await operatorValidateCheckIn(payload);
          const hist = await operatorHistoryBasic();
          setHistory(hist.items || []);
          return result;
        } finally {
          setLoading(false);
        }
      }}
    />
  );
}
