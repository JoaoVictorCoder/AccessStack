import { prisma } from "../prisma.js";

export async function createAuditLog(data, tx = prisma) {
  return tx.auditLog.create({ data });
}

export async function listAuditLogs({ page, pageSize }) {
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        actor: {
          select: {
            id: true,
            nome: true,
            email: true,
            role: true
          }
        }
      }
    }),
    prisma.auditLog.count()
  ]);
  return { items, total };
}
