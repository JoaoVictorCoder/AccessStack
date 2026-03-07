import { prisma } from "../prisma.js";

export async function createAccessAttempt(data, tx = prisma) {
  return tx.accessAttempt.create({ data });
}

export async function countRecentAttemptsByCredencial({
  credencialId,
  sinceDate,
  resultado
}, tx = prisma) {
  return tx.accessAttempt.count({
    where: {
      credencialId,
      resultado: resultado || undefined,
      createdAt: { gte: sinceDate }
    }
  });
}

export async function countRecentDeniedByGate({
  gateDeviceId,
  sinceDate
}, tx = prisma) {
  return tx.accessAttempt.count({
    where: {
      gateDeviceId: gateDeviceId || undefined,
      resultado: "DENY",
      createdAt: { gte: sinceDate }
    }
  });
}

export async function aggregateAccessAttempts() {
  const [allowed, denied, byReason, byHour] = await Promise.all([
    prisma.accessAttempt.count({ where: { resultado: "ALLOW" } }),
    prisma.accessAttempt.count({ where: { resultado: "DENY" } }),
    prisma.accessAttempt.groupBy({
      by: ["motivo"],
      _count: { _all: true }
    }),
    prisma.$queryRaw`
      SELECT EXTRACT(HOUR FROM "createdAt")::int as hour, COUNT(*)::int as count
      FROM "AccessAttempt"
      GROUP BY hour
      ORDER BY hour
    `
  ]);

  return { allowed, denied, byReason, byHour };
}

export async function findRecentDuplicateQrAttempts(minutesWindow = 5) {
  const sinceDate = new Date(Date.now() - minutesWindow * 60 * 1000);
  const rows = await prisma.accessAttempt.groupBy({
    by: ["credencialId"],
    where: {
      credencialId: { not: null },
      createdAt: { gte: sinceDate }
    },
    _count: { _all: true }
  });
  return rows
    .filter((row) => row._count._all >= 3)
    .map((row) => ({
      credencialId: row.credencialId,
      count: row._count._all
    }))
    .sort((a, b) => b.count - a.count);
}

export async function listAccessAttempts({
  page = 1,
  pageSize = 20,
  resultado,
  categoria,
  operatorId,
  comissaoResponsavelId,
  standId,
  empresaVinculadaId,
  empresaNome,
  credenciadoId,
  dateFrom,
  dateTo,
  scope
} = {}) {
  const credencialFilter =
    credenciadoId || categoria
      ? {
          credenciadoId: credenciadoId || undefined,
          credenciado: categoria ? { categoria } : undefined
        }
      : undefined;

  const where = {
    resultado: resultado || undefined,
    operatorId: operatorId || undefined,
    comissaoResponsavelId: comissaoResponsavelId || undefined,
    standId: standId || undefined,
    empresaVinculadaId: empresaVinculadaId || undefined,
    empresaNome: empresaNome || undefined,
    createdAt:
      dateFrom || dateTo
        ? {
            gte: dateFrom ? new Date(dateFrom) : undefined,
            lte: dateTo ? new Date(dateTo) : undefined
          }
        : undefined,
    credencial: credencialFilter,
    AND:
      scope?.comissaoResponsavelId
        ? [
            {
              OR: [
                { comissaoResponsavelId: scope.comissaoResponsavelId },
                { operator: { comissaoResponsavelId: scope.comissaoResponsavelId } }
              ]
            }
          ]
        : undefined
  };

  const [items, total] = await Promise.all([
    prisma.accessAttempt.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        credencial: {
          include: {
            credenciado: {
              select: {
                id: true,
                nomeCompleto: true,
                categoria: true
              }
            }
          }
        },
        gateDevice: true
      }
    }),
    prisma.accessAttempt.count({ where })
  ]);

  return { items, total };
}

export async function listStandVisitorsReport({
  standId,
  operatorId,
  comissaoResponsavelId,
  empresaVinculadaId,
  dateFrom,
  dateTo,
  categoria,
  scope
} = {}) {
  const where = {
    resultado: "ALLOW",
    standId: standId || undefined,
    operatorId: operatorId || undefined,
    comissaoResponsavelId: comissaoResponsavelId || undefined,
    empresaVinculadaId: empresaVinculadaId || undefined,
    createdAt:
      dateFrom || dateTo
        ? {
            gte: dateFrom ? new Date(dateFrom) : undefined,
            lte: dateTo ? new Date(dateTo) : undefined
          }
        : undefined,
    credencial: categoria
      ? {
          credenciado: {
            categoria
          }
        }
      : undefined,
    AND:
      scope?.comissaoResponsavelId
        ? [
            {
              OR: [
                { comissaoResponsavelId: scope.comissaoResponsavelId },
                { operator: { comissaoResponsavelId: scope.comissaoResponsavelId } }
              ]
            }
          ]
        : undefined
  };

  return prisma.accessAttempt.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      credencial: {
        include: {
          credenciado: {
            select: {
              id: true,
              nomeCompleto: true,
              email: true,
              celular: true,
              categoria: true,
              municipio: true,
              uf: true,
              aceitouCompartilhamentoComExpositores: true
            }
          }
        }
      }
    }
  });
}

export async function findAccessAttemptById(id, scope) {
  return prisma.accessAttempt.findFirst({
    where: {
      id,
      AND:
        scope?.comissaoResponsavelId
          ? [
              {
                OR: [
                  { comissaoResponsavelId: scope.comissaoResponsavelId },
                  { operator: { comissaoResponsavelId: scope.comissaoResponsavelId } }
                ]
              }
            ]
          : undefined
    },
    include: {
      credencial: {
        include: {
          credenciado: {
            select: {
              id: true,
              nomeCompleto: true,
              categoria: true
            }
          }
        }
      },
      gateDevice: true
    }
  });
}
