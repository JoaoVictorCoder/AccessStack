import {
  findAccessAttemptById,
  listAccessAttempts
} from "../repositories/accessAttemptRepository.js";
import {
  buildPaginatedPayload,
  parseOptionalStringQuery,
  parsePagination
} from "../http/queryParsers.js";
import { resolveComissaoScopeFromAuth } from "../http/actorContext.js";

export async function listAccessLogsAdminHandler(req, res) {
  const { page, pageSize } = parsePagination(req.query, {
    defaultPage: 1,
    defaultPageSize: 20,
    maxPageSize: 100
  });

  const { items, total } = await listAccessAttempts({
    page,
    pageSize,
    resultado: parseOptionalStringQuery(req.query, "resultado"),
    categoria: parseOptionalStringQuery(req.query, "categoria"),
    operatorId: parseOptionalStringQuery(req.query, "operatorId"),
    comissaoResponsavelId: parseOptionalStringQuery(req.query, "comissaoResponsavelId"),
    standId: parseOptionalStringQuery(req.query, "standId"),
    empresaVinculadaId: parseOptionalStringQuery(req.query, "empresaVinculadaId"),
    empresaNome: parseOptionalStringQuery(req.query, "empresaNome"),
    credenciadoId: parseOptionalStringQuery(req.query, "credenciadoId"),
    dateFrom: parseOptionalStringQuery(req.query, "dateFrom"),
    dateTo: parseOptionalStringQuery(req.query, "dateTo"),
    scope: resolveComissaoScopeFromAuth(req.auth)
  });

  return res.json(
    buildPaginatedPayload({
      items: items.map((item) => ({
        id: item.id,
        credencialId: item.credencialId,
        credenciadoId: item.credencial?.credenciado?.id || null,
        nomeCredenciado: item.credencial?.credenciado?.nomeCompleto || null,
        categoria: item.credencial?.credenciado?.categoria || null,
        operatorId: item.operatorId,
        operatorNome: item.operatorNome,
        operatorEmail: item.operatorEmail,
        operatorRole: item.operatorRole,
        standId: item.standId,
        standName: item.standName,
        empresaNome: item.empresaNome,
        empresaVinculadaId: item.empresaVinculadaId,
        empresaVinculadaNome: item.empresaVinculadaNome,
        comissaoResponsavelId: item.comissaoResponsavelId,
        comissaoResponsavelNome: item.comissaoResponsavelNome,
        deviceId: item.deviceId,
        deviceInfo: item.deviceInfo,
        accessPoint: item.accessPoint,
        gate: item.gateDevice
          ? {
              id: item.gateDevice.id,
              codigo: item.gateDevice.codigo,
              nome: item.gateDevice.nome
            }
          : null,
        resultado: item.resultado,
        motivo: item.motivo,
        createdAt: item.createdAt
      })),
      page,
      pageSize,
      total
    })
  );
}

export async function getAccessLogByIdAdminHandler(req, res) {
  const item = await findAccessAttemptById(req.params.id, resolveComissaoScopeFromAuth(req.auth));
  if (!item) {
    return res.status(404).json({ error: "log de acesso nao encontrado" });
  }

  return res.json({
    id: item.id,
    credencialId: item.credencialId,
    credenciadoId: item.credencial?.credenciado?.id || null,
    nomeCredenciado: item.credencial?.credenciado?.nomeCompleto || null,
    categoria: item.credencial?.credenciado?.categoria || null,
    operatorId: item.operatorId,
    operatorNome: item.operatorNome,
    operatorEmail: item.operatorEmail,
    operatorRole: item.operatorRole,
    standId: item.standId,
    standName: item.standName,
    empresaNome: item.empresaNome,
    empresaVinculadaId: item.empresaVinculadaId,
    empresaVinculadaNome: item.empresaVinculadaNome,
    comissaoResponsavelId: item.comissaoResponsavelId,
    comissaoResponsavelNome: item.comissaoResponsavelNome,
    deviceId: item.deviceId,
    deviceInfo: item.deviceInfo,
    accessPoint: item.accessPoint,
    gate: item.gateDevice,
    resultado: item.resultado,
    motivo: item.motivo,
    metadata: item.metadata,
    createdAt: item.createdAt
  });
}
