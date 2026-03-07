import { useEffect, useMemo, useRef, useState } from "react";
import jsQR from "jsqr";

function getDeviceId() {
  const key = "operator_device_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const created = `dev-${crypto.randomUUID()}`;
  localStorage.setItem(key, created);
  return created;
}

function deviceInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${window.screen.width}x${window.screen.height}`
  };
}

function decodeCodigoFromQrText(text) {
  if (!text) return "";
  const trimmed = String(text).trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed?.credentialCode) return String(parsed.credentialCode).trim();
  } catch {
    // no-op
  }
  return trimmed;
}

export default function OperatorConsole({ operator, onValidate, history, loading }) {
  const [codigoUnico, setCodigoUnico] = useState("");
  const [observacaoOperacional, setObservacaoOperacional] = useState("");
  const [result, setResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [scanStatus, setScanStatus] = useState("idle");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanTimerRef = useRef(null);
  const rafRef = useRef(null);
  const detectorRef = useRef(null);
  const canvasRef = useRef(null);
  const lastReadRef = useRef({ text: "", at: 0 });
  const validatingRef = useRef(false);
  const localDeviceId = useMemo(() => getDeviceId(), []);

  const canUseCamera = operator?.permissoesCustomizadas?.podeUsarCameraParaLeituraQR !== false;

  function stopCamera() {
    if (scanTimerRef.current) {
      window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setScanStatus("idle");
  }

  async function validateByCode(rawText) {
    const decodedCode = decodeCodigoFromQrText(rawText);
    if (!decodedCode) return;
    const now = Date.now();
    if (lastReadRef.current.text === decodedCode && now - lastReadRef.current.at < 3000) {
      return;
    }
    lastReadRef.current = { text: decodedCode, at: now };
    setScanStatus("validating");
    validatingRef.current = true;
    try {
      const response = await onValidate({
        codigoUnico: decodedCode,
        gateCode: "MOBILE-OPERATOR",
        accessPoint: operator?.standName || "Entrada Principal",
        deviceId: localDeviceId,
        deviceInfo: deviceInfo(),
        observacaoOperacional
      });
      setCodigoUnico(decodedCode);
      setResult(response);
      setScanStatus("idle");
    } finally {
      validatingRef.current = false;
    }
  }

  async function startCamera() {
    setCameraError("");
    if (!canUseCamera) {
      setCameraError("Seu perfil nao possui permissao para usar camera.");
      return;
    }
    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError("Camera nao suportada neste navegador.");
      return;
    }

    try {
      if ("BarcodeDetector" in window) {
        detectorRef.current = new window.BarcodeDetector({ formats: ["qr_code"] });
      } else {
        detectorRef.current = null;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setScanStatus("scanning");

      const detectOnce = async () => {
        if (!videoRef.current || validatingRef.current || videoRef.current.readyState < 2) {
          rafRef.current = window.requestAnimationFrame(detectOnce);
          return;
        }
        if (!videoRef.current || validatingRef.current) return;
        try {
          if (detectorRef.current) {
            const results = await detectorRef.current.detect(videoRef.current);
            if (results?.length) {
              await validateByCode(results[0].rawValue || "");
            }
          } else {
            const video = videoRef.current;
            if (!canvasRef.current) {
              canvasRef.current = document.createElement("canvas");
            }
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const qr = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "attemptBoth"
              });
              if (qr?.data) {
                await validateByCode(qr.data);
              }
            }
          }
        } catch {
          // leitura continua
        } finally {
          rafRef.current = window.requestAnimationFrame(detectOnce);
        }
      };
      rafRef.current = window.requestAnimationFrame(detectOnce);
    } catch (error) {
      if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {
        setCameraError("Permissao de camera negada.");
      } else if (error?.name === "NotFoundError" || error?.name === "DevicesNotFoundError") {
        setCameraError("Nenhuma camera disponivel neste dispositivo.");
      } else {
        setCameraError("Nao foi possivel acessar a camera. Verifique permissoes.");
      }
      stopCamera();
      console.error(error);
    }
  }

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <main className="single-page operator-page">
      <section className="card card-elevated">
        <h2>Operador QR</h2>
        <p className="section-subtitle">
          {operator?.nome} - {operator?.role} | Stand: {operator?.standName || "-"}
        </p>
        <p className="hint-text">Device ID: {localDeviceId}</p>

        <div className="toolbar">
          {!cameraActive ? (
            <button type="button" onClick={startCamera} disabled={loading}>
              Ler QR Code
            </button>
          ) : (
            <button type="button" className="btn-danger" onClick={stopCamera}>
              Parar camera
            </button>
          )}
          <span className="hint-text">
            {scanStatus === "scanning" && "Camera ativa: aponte para o QR"}
            {scanStatus === "validating" && "Validando leitura..."}
          </span>
        </div>

        {cameraActive && (
          <div className="operator-camera-wrap">
            <video ref={videoRef} className="operator-camera" muted playsInline />
          </div>
        )}
        {cameraError && <p className="error">{cameraError}</p>}

        <form
          className="grid single-column"
          onSubmit={async (event) => {
            event.preventDefault();
            await validateByCode(codigoUnico);
          }}
        >
          <label>
            Codigo/QR da credencial
            <input value={codigoUnico} onChange={(e) => setCodigoUnico(e.target.value)} required />
          </label>
          <label>
            Observacao operacional
            <input
              value={observacaoOperacional}
              onChange={(e) => setObservacaoOperacional(e.target.value)}
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Validando..." : "Validar entrada"}
          </button>
        </form>

        {result && (
          <div className={result.resultado === "ALLOW" ? "success-box" : "error-box"}>
            <strong>{result.resultado === "ALLOW" ? "Acesso Liberado" : "Acesso Negado"}</strong>
            <p>Motivo: {result.motivo}</p>
            <p>Credenciado: {result.credenciado?.nomeCompleto || "-"}</p>
            <p>Categoria: {result.credenciado?.categoria || "-"}</p>
          </div>
        )}
      </section>

      <section className="card">
        <h3>Historico basico</h3>
        <ul className="event-list compact">
          {(history || []).map((item) => (
            <li key={item.id} className="event-item">
              <strong>{item.resultado}</strong>
              <span>{item.nomeCredenciado || "Sem vinculo"}</span>
              <small>{new Date(item.createdAt).toLocaleString("pt-BR")}</small>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
