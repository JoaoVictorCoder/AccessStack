import {
  listEventosSistema,
  listEventosSistemaWithFilters
} from "../repositories/eventoSistemaRepository.js";
import { mapEventoSistema } from "../mappers/identityMapper.js";
import { TipoEventoSistema } from "../domain/enums.js";

export async function listEventosSistemaAdminHandler(req, res) {
  const limit = Number(req.query.limit || 100);
  const boundedLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 500) : 100;
  const tipoEvento = typeof req.query.tipoEvento === "string" ? req.query.tipoEvento : undefined;

  if (tipoEvento && !Object.values(TipoEventoSistema).includes(tipoEvento)) {
    return res.status(400).json({ error: "tipoEvento invalido" });
  }

  const events = tipoEvento || req.query.limit
    ? await listEventosSistemaWithFilters({ limit: boundedLimit, tipoEvento })
    : await listEventosSistema();

  return res.json(events.map(mapEventoSistema));
}
