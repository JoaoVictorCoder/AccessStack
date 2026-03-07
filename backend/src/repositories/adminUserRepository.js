import { prisma } from "../prisma.js";

const internalUserInclude = {
  comissaoResponsavel: {
    select: {
      id: true,
      nome: true,
      email: true
    }
  }
};

export async function findAdminByEmail(email) {
  return prisma.adminUser.findUnique({
    where: { email },
    include: internalUserInclude
  });
}

export async function findAdminById(id) {
  return prisma.adminUser.findUnique({
    where: { id },
    include: internalUserInclude
  });
}

export async function listInternalUsers(where = {}) {
  return prisma.adminUser.findMany({
    where,
    include: internalUserInclude,
    orderBy: { createdAt: "desc" }
  });
}

export async function findInternalUserByIdScoped(id, where = {}) {
  return prisma.adminUser.findFirst({
    where: { id, ...where },
    include: internalUserInclude
  });
}

export async function createInternalUser(data) {
  return prisma.adminUser.create({ data, include: internalUserInclude });
}

export async function updateInternalUser(id, data) {
  return prisma.adminUser.update({
    where: { id },
    data,
    include: internalUserInclude
  });
}
