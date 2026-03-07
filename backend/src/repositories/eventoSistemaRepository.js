import { prisma } from "../prisma.js";

export async function createEventoSistema(data, tx = prisma) {
  return tx.eventoSistema.create({ data });
}

export async function listEventosSistema() {
  return prisma.eventoSistema.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      credenciado: {
        select: {
          id: true,
          nomeCompleto: true,
          categoria: true,
          statusCredenciamento: true
        }
      }
    }
  });
}

export async function listEventosSistemaWithFilters({ limit, tipoEvento }) {
  return prisma.eventoSistema.findMany({
    where: {
      tipoEvento: tipoEvento || undefined
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      credenciado: {
        select: {
          id: true,
          nomeCompleto: true,
          categoria: true,
          statusCredenciamento: true
        }
      }
    }
  });
}

export async function listEventosByCredenciadoId(credenciadoId, limit) {
  return prisma.eventoSistema.findMany({
    where: { credenciadoId },
    take: limit,
    orderBy: { createdAt: "desc" }
  });
}
