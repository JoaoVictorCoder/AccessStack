import { prisma } from "../prisma.js";

export async function createCredencial(data, tx = prisma) {
  return tx.credencial.create({ data });
}

export async function findCredencialById(id) {
  return prisma.credencial.findUnique({
    where: { id },
    include: { credenciado: true }
  });
}

export async function existsByCodigoUnico(codigoUnico, tx = prisma) {
  const found = await tx.credencial.findUnique({ where: { codigoUnico } });
  return Boolean(found);
}
