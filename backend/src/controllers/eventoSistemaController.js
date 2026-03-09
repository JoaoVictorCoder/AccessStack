import {
  listEventosSistema,
  listEventosSistemaWithFilters
} from "../repositories/eventoSistemaRepository.js";
import { mapEventoSistema } from "../mappers/identityMapper.js";
import { TipoEventoSistema } from "../domain/enums.js";
import { parseBoundedLimit, parseOptionalStringQuery } from "../http/queryParsers.js";

export async function listEventosSistemaAdminHandler(req, res) {
  const boundedLimit = parseBoundedLimit(req.query.limit, {
    defaultLimit: 100,
    maxLimit: 500
  });
  const tipoEvento = parseOptionalStringQuery(req.query, "tipoEvento");

  if (tipoEvento && !Object.values(TipoEventoSistema).includes(tipoEvento)) {
    return res.status(400).json({ error: "tipoEvento invalido" });
  }

  const events = tipoEvento || req.query.limit
    ? await listEventosSistemaWithFilters({ limit: boundedLimit, tipoEvento })
    : await listEventosSistema();

  return res.json(events.map(mapEventoSistema));
}
