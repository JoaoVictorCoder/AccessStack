import { prisma } from "../prisma.js";

export async function findGateDeviceByCodigo(codigo) {
  if (!codigo) {
    return null;
  }
  return prisma.gateDevice.findUnique({ where: { codigo } });
}

export async function upsertGateDevice({ codigo, nome, localizacao }, tx = prisma) {
  return tx.gateDevice.upsert({
    where: { codigo },
    update: {
      nome: nome || codigo,
      localizacao: localizacao || null
    },
    create: {
      codigo,
      nome: nome || codigo,
      localizacao: localizacao || null
    }
  });
}
