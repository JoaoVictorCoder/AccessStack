import { AccessReason } from "../domain/enums.js";

export function validateCheckInRequestDTO(payload) {
  const errors = [];
  const codigoUnico = typeof payload?.codigoUnico === "string" ? payload.codigoUnico.trim() : "";
  const gateCode = typeof payload?.gateCode === "string" ? payload.gateCode.trim() : "";
  const accessPoint = typeof payload?.accessPoint === "string" ? payload.accessPoint.trim() : "";

  if (!codigoUnico) {
    errors.push("codigoUnico e obrigatorio");
  }
  if (!gateCode) {
    errors.push("gateCode e obrigatorio");
  }

  if (errors.length) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      codigoUnico,
      gateCode,
      accessPoint: accessPoint || gateCode
    }
  };
}

export const checkInReasons = Object.values(AccessReason);
