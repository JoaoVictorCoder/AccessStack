import { prisma } from "../prisma.js";
import {
  aggregateAccessAttempts,
  countRecentDeniedByGate,
  findRecentDuplicateQrAttempts
} from "../repositories/accessAttemptRepository.js";
import { toFraudInsightDTO } from "../mappers/identityMapper.js";

export async function getAnalyticsOverview() {
  const [totalCredenciados, totalCredenciaisGeradas, accessStats, byCategoria] =
    await Promise.all([
      prisma.credenciado.count(),
      prisma.credencial.count(),
      aggregateAccessAttempts(),
      prisma.credenciado.groupBy({
        by: ["categoria"],
        _count: { _all: true }
      })
    ]);

  return {
    totalCredenciados,
    totalCredenciaisGeradas,
    totalCheckInsPermitidos: accessStats.allowed,
    totalCheckInsNegados: accessStats.denied,
    acessosPorCategoria: byCategoria.map((item) => ({
      categoria: item.categoria,
      total: item._count._all
    })),
    acessosPorFaixaHorario: accessStats.byHour,
    principaisMotivosRecusa: accessStats.byReason
      .filter((item) => item.motivo !== "ACESSO_PERMITIDO")
      .map((item) => ({ motivo: item.motivo, total: item._count._all }))
  };
}

export async function getFraudInsights() {
  const sinceDate = new Date(Date.now() - 10 * 60 * 1000);
  const [duplicateQr, usedCredentialAttempts, blockedCredentialAttempts, deniedByGate] =
    await Promise.all([
      findRecentDuplicateQrAttempts(5),
      prisma.accessAttempt.findMany({
        where: {
          motivo: "JA_UTILIZADA",
          createdAt: { gte: sinceDate }
        },
        take: 20
      }),
      prisma.accessAttempt.findMany({
        where: {
          motivo: "CREDENCIAL_BLOQUEADA",
          createdAt: { gte: sinceDate }
        },
        take: 20
      }),
      prisma.gateDevice.findMany({
        take: 20
      })
    ]);

  const insights = [];

  for (const item of duplicateQr) {
    insights.push(
      toFraudInsightDTO({
        type: "DUPLICATE_QR_SHORT_WINDOW",
        severity: "HIGH",
        message: "Multiplas tentativas do mesmo QR em curto intervalo",
        credencialId: item.credencialId,
        count: item.count
      })
    );
  }

  for (const item of usedCredentialAttempts) {
    insights.push(
      toFraudInsightDTO({
        type: "REUSE_AFTER_USED",
        severity: "HIGH",
        message: "Tentativa de reutilizacao de credencial ja utilizada",
        credencialId: item.credencialId,
        count: 1
      })
    );
  }

  for (const item of blockedCredentialAttempts) {
    insights.push(
      toFraudInsightDTO({
        type: "BLOCKED_CREDENTIAL_ATTEMPT",
        severity: "MEDIUM",
        message: "Credencial bloqueada tentando acesso",
        credencialId: item.credencialId,
        count: 1
      })
    );
  }

  for (const gate of deniedByGate) {
    const denied = await countRecentDeniedByGate({
      gateDeviceId: gate.id,
      sinceDate
    });
    if (denied >= 5) {
      insights.push(
        toFraudInsightDTO({
          type: "EXCESSIVE_DENY_BY_GATE",
          severity: "MEDIUM",
          message: "Excesso de recusas por gate/device",
          gateDeviceId: gate.id,
          count: denied
        })
      );
    }
  }

  return insights;
}
