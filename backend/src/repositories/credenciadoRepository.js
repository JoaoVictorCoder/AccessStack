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

export async function listCredenciadosPaginated({
  search,
  categoria,
  page,
  pageSize
}) {
  const where = {
    categoria: categoria || undefined,
    OR: search
      ? [
          { nomeCompleto: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } }
        ]
      : undefined
  };

  const [items, total] = await Promise.all([
    prisma.credenciado.findMany({
      where,
      include: includeIdentity,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.credenciado.count({ where })
  ]);

  return { items, total };
}

export async function findCredenciadoById(id) {
  return prisma.credenciado.findUnique({
    where: { id },
    include: includeIdentity
  });
}
