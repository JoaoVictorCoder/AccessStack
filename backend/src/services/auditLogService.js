import { AuditActorType } from "../domain/enums.js";
import { createAuditLog } from "../repositories/auditLogRepository.js";

export async function logAdminAction({
  actorId,
  actorType = AuditActorType.ADMIN_USER,
  acao,
  recurso,
  recursoId,
  detalhes
}) {
  return createAuditLog({
    actorType,
    actorId: actorId || null,
    acao,
    recurso,
    recursoId: recursoId || null,
    detalhes: detalhes || null
  });
}
