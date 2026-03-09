import { toAuditLogResponseDTO } from "../mappers/identityMapper.js";
import { listAuditLogs } from "../repositories/auditLogRepository.js";
import { buildPaginatedPayload, parsePagination } from "../http/queryParsers.js";

export async function listAuditLogsAdminHandler(req, res) {
  const { page, pageSize } = parsePagination(req.query, {
    defaultPage: 1,
    defaultPageSize: 20,
    maxPageSize: 100
  });

  const { items, total } = await listAuditLogs({ page, pageSize });
  return res.json(
    buildPaginatedPayload({
      items: items.map(toAuditLogResponseDTO),
      page,
      pageSize,
      total
    })
  );
}
