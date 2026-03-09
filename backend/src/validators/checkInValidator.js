import { AccessReason } from "../domain/enums.js";

function truncate(value, maxLen) {
  if (typeof value !== "string") {
    return "";
  }
  const normalized = value.trim();
  return normalized.length > maxLen ? normalized.slice(0, maxLen) : normalized;
}

function sanitizeDeviceInfo(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const allowedKeys = ["userAgent", "platform", "language", "timezone", "screen"];
  const clean = {};

  for (const key of allowedKeys) {
    if (typeof raw[key] === "string") {
      clean[key] = truncate(raw[key], 200);
    }
  }

  return Object.keys(clean).length ? clean : null;
}

export function validateCheckInRequestDTO(payload) {
  const errors = [];
  const codigoUnico = truncate(payload?.codigoUnico, 120);
  const gateCode = truncate(payload?.gateCode, 80);
  const accessPoint = truncate(payload?.accessPoint, 120);
  const deviceId = truncate(payload?.deviceId, 120);
  const deviceInfo = sanitizeDeviceInfo(payload?.deviceInfo);
  const observacaoOperacional = truncate(payload?.observacaoOperacional, 500);

  if (!codigoUnico) {
    errors.push("codigoUnico e obrigatorio");
  }
  if (!gateCode) {
    errors.push("gateCode e obrigatorio");
  }
  if (codigoUnico.length < 4) {
    errors.push("codigoUnico invalido");
  }

  if (errors.length) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      codigoUnico,
      gateCode,
      accessPoint: accessPoint || gateCode,
      deviceId: deviceId || null,
      deviceInfo,
      observacaoOperacional: observacaoOperacional || null
    }
  };
}

export const checkInReasons = Object.values(AccessReason);
