import { prisma } from "../prisma.js";
import {
  AccessReason,
  AccessResult,
  StatusCredencial,
  StatusCredenciamento,
  TipoEventoSistema
} from "../domain/enums.js";
import {
  createAccessAttempt,
  countRecentAttemptsByCredencial
} from "../repositories/accessAttemptRepository.js";
import {
  findCredencialByCodigoUnico,
  updateCredencialStatus
} from "../repositories/credencialRepository.js";
import { upsertGateDevice } from "../repositories/gateDeviceRepository.js";
import { createEventoSistema } from "../repositories/eventoSistemaRepository.js";
import { createAuditLog } from "../repositories/auditLogRepository.js";
import { MockGateProvider } from "../providers/gate/mockGateProvider.js";

const gateProvider = new MockGateProvider();

function withinGateSchedule(now = new Date()) {
  const startHour = Number(process.env.GATE_START_HOUR ?? 0);
  const endHour = Number(process.env.GATE_END_HOUR ?? 23);
  const hour = now.getHours();
  return hour >= startHour && hour <= endHour;
}

export async function validateAndCheckIn(
  { codigoUnico, gateCode, accessPoint },
  actor
) {
  return prisma.$transaction(async (tx) => {
    const gateDevice = await upsertGateDevice(
      {
        codigo: gateCode,
        nome: `Gate ${gateCode}`,
        localizacao: accessPoint || gateCode
      },
      tx
    );

    const credencial = await findCredencialByCodigoUnico(codigoUnico, tx);
    if (!credencial) {
      await createAccessAttempt(
        {
          credencialId: null,
          gateDeviceId: gateDevice.id,
          accessPoint: accessPoint || gateCode,
          resultado: AccessResult.DENY,
          motivo: AccessReason.CREDENCIAL_INVALIDA,
          metadata: { codigoUnico }
        },
        tx
      );
      await createAuditLog(
        {
          actorType: actor?.actorType || "SYSTEM",
          actorId: actor?.actorId || null,
          acao: "CHECKIN_VALIDATE",
          recurso: "CREDENCIAL",
          detalhes: {
            resultado: AccessResult.DENY,
            motivo: AccessReason.CREDENCIAL_INVALIDA,
            codigoUnico
          }
        },
        tx
      );
      return {
        allowed: false,
        reason: AccessReason.CREDENCIAL_INVALIDA,
        credencial: null,
        gateDevice,
        gateResponse: await gateProvider.sendAccessDecision({
          gateDevice,
          decision: AccessResult.DENY,
          reason: AccessReason.CREDENCIAL_INVALIDA,
          metadata: { codigoUnico }
        })
      };
    }

    let reason = AccessReason.ACESSO_PERMITIDO;
    let allowed = true;

    if (!withinGateSchedule()) {
      reason = AccessReason.FORA_DO_HORARIO;
      allowed = false;
    } else if (credencial.statusCredencial === StatusCredencial.INATIVA) {
      reason = AccessReason.CREDENCIAL_BLOQUEADA;
      allowed = false;
    } else if (credencial.statusCredencial === StatusCredencial.UTILIZADA) {
      reason = AccessReason.JA_UTILIZADA;
      allowed = false;
    } else if (credencial.credenciado.statusCredenciamento === StatusCredenciamento.BLOQUEADO) {
      reason = AccessReason.CREDENCIAL_BLOQUEADA;
      allowed = false;
    }

    const result = allowed ? AccessResult.ALLOW : AccessResult.DENY;

    await createAccessAttempt(
      {
        credencialId: credencial.id,
        gateDeviceId: gateDevice.id,
        accessPoint: accessPoint || gateCode,
        resultado: result,
        motivo: reason,
        metadata: {
          credenciadoId: credencial.credenciado.id,
          categoria: credencial.credenciado.categoria
        }
      },
      tx
    );

    if (allowed) {
      await tx.credenciado.update({
        where: { id: credencial.credenciado.id },
        data: { statusCredenciamento: StatusCredenciamento.CHECKED_IN }
      });
      await updateCredencialStatus(credencial.id, StatusCredencial.UTILIZADA, tx);
      await createEventoSistema(
        {
          credenciadoId: credencial.credenciado.id,
          tipoEvento: TipoEventoSistema.ACESSO_VALIDADO,
          descricao: "Acesso validado no check-in",
          metadata: { gateCode, accessPoint: accessPoint || gateCode }
        },
        tx
      );
    } else {
      await createEventoSistema(
        {
          credenciadoId: credencial.credenciado.id,
          tipoEvento: TipoEventoSistema.ACESSO_NEGADO,
          descricao: "Acesso negado no check-in",
          metadata: { reason, gateCode, accessPoint: accessPoint || gateCode }
        },
        tx
      );
    }

    const attemptsLast5Min = await countRecentAttemptsByCredencial(
      {
        credencialId: credencial.id,
        sinceDate: new Date(Date.now() - 5 * 60 * 1000)
      },
      tx
    );

    await createAuditLog(
      {
        actorType: actor?.actorType || "SYSTEM",
        actorId: actor?.actorId || null,
        acao: "CHECKIN_VALIDATE",
        recurso: "CREDENCIAL",
        recursoId: credencial.id,
        detalhes: {
          resultado: result,
          motivo: reason,
          gateCode,
          attemptsLast5Min
        }
      },
      tx
    );

    const gateResponse = await gateProvider.sendAccessDecision({
      gateDevice,
      decision: result,
      reason,
      metadata: {
        credencialId: credencial.id,
        credenciadoId: credencial.credenciado.id
      }
    });

    return {
      allowed,
      reason,
      credencial,
      gateDevice,
      gateResponse
    };
  });
}
