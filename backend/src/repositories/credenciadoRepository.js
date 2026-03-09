import { prisma } from "../prisma.js";
import { credenciadoIdentityInclude } from "./queryFragments.js";

export async function createCredenciado(data, tx = prisma) {
  return tx.credenciado.create({ data, include: credenciadoIdentityInclude });
}

export async function listCredenciados() {
  return prisma.credenciado.findMany({
    include: credenciadoIdentityInclude,
    orderBy: { createdAt: "desc" }
  });
}

export async function listCredenciadosPaginated({
  search,
  categoria,
  page,
  pageSize
}) {
  // Os filtros da listagem admin nascem aqui. Se novos campos de busca forem
  // adicionados no frontend, inclua o mapeamento correspondente neste `where`.
  const where = {
    categoria: categoria || undefined,
    OR: search
      ? [
          { nomeCompleto: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { cpf: { contains: search.replace(/\D/g, "") || search, mode: "insensitive" } },
          { cnpj: { contains: search.replace(/\D/g, "") || search, mode: "insensitive" } },
          { credencial: { codigoUnico: { contains: search, mode: "insensitive" } } }
        ]
      : undefined
  };

  const [items, total] = await Promise.all([
    prisma.credenciado.findMany({
      where,
      include: credenciadoIdentityInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.credenciado.count({ where })
  ]);

  return { items, total };
}

export async function findCredenciadoById(id, tx = prisma) {
  return tx.credenciado.findUnique({
    where: { id },
    include: credenciadoIdentityInclude
  });
}

export async function updateCredenciadoById(id, data, tx = prisma) {
  return tx.credenciado.update({
    where: { id },
    data,
    include: credenciadoIdentityInclude
  });
}
