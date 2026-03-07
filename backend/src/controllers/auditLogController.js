import { toAuditLogResponseDTO } from "../mappers/identityMapper.js";
import { listAuditLogs } from "../repositories/auditLogRepository.js";

export async function listAuditLogsAdminHandler(req, res) {
  const page = Math.max(Number(req.query.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(req.query.pageSize || 20), 1), 100);

  const { items, total } = await listAuditLogs({ page, pageSize });
  return res.json({
    items: items.map(toAuditLogResponseDTO),
    page,
    pageSize,
    total,
    totalPages: Math.max(Math.ceil(total / pageSize), 1)
  });
}
