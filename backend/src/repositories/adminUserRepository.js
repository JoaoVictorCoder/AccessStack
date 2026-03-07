import { prisma } from "../prisma.js";

export async function findAdminByEmail(email) {
  return prisma.adminUser.findUnique({
    where: { email }
  });
}

export async function findAdminById(id) {
  return prisma.adminUser.findUnique({
    where: { id }
  });
}
