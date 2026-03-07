import { toCheckInResponseDTO } from "../mappers/identityMapper.js";
import { validateAndCheckIn } from "../services/checkInService.js";
import { validateCheckInRequestDTO } from "../validators/checkInValidator.js";

export async function validateCheckInHandler(req, res) {
  const validation = validateCheckInRequestDTO(req.body || {});
  if (!validation.valid) {
    return res.status(400).json({ errors: validation.errors });
  }

  const result = await validateAndCheckIn(validation.data, {
    actorType: req.auth?.role === "APP_GATE" ? "APP_GATE" : "ADMIN_USER",
    actorId: req.auth?.id
  });

  return res.json(
    toCheckInResponseDTO({
      allowed: result.allowed,
      reason: result.reason,
      credencialId: result.credencial?.id,
      codigoUnico: result.credencial?.codigoUnico,
      credenciado: result.credencial?.credenciado
    })
  );
}
