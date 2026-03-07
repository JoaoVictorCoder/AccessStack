import { prisma } from "../prisma.js";

const includeIdentity = {
  credencial: true
};

export async function createCredenciado(data, tx = prisma) {
  return tx.credenciado.create({ data, include: includeIdentity });
}

export async function listCredenciados() {
  return prisma.credenciado.findMany({
    include: includeIdentity,
    orderBy: { createdAt: "desc" }
  });
}

export async function findCredenciadoById(id) {
  return prisma.credenciado.findUnique({
    where: { id },
    include: includeIdentity
  });
}
