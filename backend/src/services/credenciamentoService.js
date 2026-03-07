import { prisma } from "../prisma.js";
import {
  StatusCredenciamento,
  StatusCredencial,
  TipoEventoSistema
} from "../domain/enums.js";
import { generateCredentialCode } from "../utils/codeGenerator.js";
import { createCredenciado } from "../repositories/credenciadoRepository.js";
import {
  createCredencial,
  existsByCodigoUnico
} from "../repositories/credencialRepository.js";
import { createEventoSistema } from "../repositories/eventoSistemaRepository.js";

async function generateUniqueCredentialCode(tx) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateCredentialCode();
    const exists = await existsByCodigoUnico(code, tx);
    if (!exists) {
      return code;
    }
  }
  throw new Error("nao foi possivel gerar codigo unico da credencial");
}

function buildQrPayload({ credenciadoId, credentialCode }) {
  return JSON.stringify({
    version: 1,
    credenciadoId,
    credentialCode,
    issuedAt: new Date().toISOString()
  });
}

export async function createCredenciamento(identityPayload) {
  return prisma.$transaction(async (tx) => {
    const createdCredenciado = await createCredenciado(
      {
        ...identityPayload,
        statusCredenciamento: StatusCredenciamento.CADASTRADO
      },
      tx
    );

    const credentialCode = await generateUniqueCredentialCode(tx);
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
          statusCredenciamento: createdCredenciado.statusCredenciamento
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

    return {
      ...createdCredenciado,
      credencial
    };
  });
}
