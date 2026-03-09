import { prisma } from "../prisma.js";
import {
  StatusCredenciamento,
  StatusCredencial,
  TipoEventoSistema
} from "../domain/enums.js";
import { createCredenciado } from "../repositories/credenciadoRepository.js";
import { createCredencial } from "../repositories/credencialRepository.js";
import { createEventoSistema } from "../repositories/eventoSistemaRepository.js";
import { createAuditLog } from "../repositories/auditLogRepository.js";
import { findOrCreateDefaultEvento } from "../repositories/eventoRepository.js";
import { generateUniqueCredentialCode } from "./credentialCodeService.js";

function buildQrPayload({ credenciadoId, credentialCode }) {
  return JSON.stringify({
    version: 1,
    credenciadoId,
    credentialCode,
    issuedAt: new Date().toISOString()
  });
}

export async function createCredenciamento(identityPayload, actor = null) {
  return prisma.$transaction(async (tx) => {
    const evento = await findOrCreateDefaultEvento(tx);

    const createdCredenciado = await createCredenciado(
      {
        ...identityPayload,
        eventoId: identityPayload.eventoId || evento.id,
        cidadeOrigem: null,
        combustivel: null,
        distanciaKm: null,
        pegadaCarbonoEstimada: null,
        statusCredenciamento: StatusCredenciamento.CADASTRADO
      },
      tx
    );

    const credentialCode = await generateUniqueCredentialCode(tx, {
      errorMessage: "nao foi possivel gerar codigo unico da credencial"
    });
    const qrCodePayload = buildQrPayload({
      credenciadoId: createdCredenciado.id,
      credentialCode
    });

    const credencial = await createCredencial(
      {
        credenciadoId: createdCredenciado.id,
        codigoUnico: credentialCode,
        qrCodePayload,
        statusCredencial: StatusCredencial.GERADA,
        emitidaEm: new Date()
      },
      tx
    );

    await createEventoSistema(
      {
        credenciadoId: createdCredenciado.id,
        tipoEvento: TipoEventoSistema.CREDENCIAMENTO_CRIADO,
        descricao: "Credenciamento criado com sucesso",
        metadata: {
          categoria: createdCredenciado.categoria,
          statusCredenciamento: createdCredenciado.statusCredenciamento,
          eventoId: createdCredenciado.eventoId
        }
      },
      tx
    );

    await createEventoSistema(
      {
        credenciadoId: createdCredenciado.id,
        tipoEvento: TipoEventoSistema.CREDENCIAL_GERADA,
        descricao: "Credencial digital gerada",
        metadata: {
          codigoUnico: credencial.codigoUnico,
          statusCredencial: credencial.statusCredencial
        }
      },
      tx
    );

    await createAuditLog(
      {
        actorType: actor?.actorType || "SYSTEM",
        actorId: actor?.actorId || null,
        acao: "CREDENCIAMENTO_CRIADO",
        recurso: "CREDENCIADO",
        recursoId: createdCredenciado.id,
        detalhes: {
          categoria: createdCredenciado.categoria,
          credencialId: credencial.id
        }
      },
      tx
    );

    return {
      ...createdCredenciado,
      credencial
    };
  });
}
