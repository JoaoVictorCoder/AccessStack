import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const seeds = [
    {
      categoria: "EXPOSITOR",
      nomeCompleto: "Mariana Silva",
      cpf: "11111111111",
      rg: "1234567",
      celular: "11999990001",
      email: "mariana.expositor@demo.com",
      municipio: "Campinas",
      uf: "SP",
      aceitouLgpd: true,
      cnpj: "12345678000199",
      siteEmpresa: "https://cafesdeminas.com.br",
      nomeEmpresa: "Cafes de Minas"
    },
    {
      categoria: "CAFEICULTOR",
      nomeCompleto: "Carlos Pereira",
      cpf: "22222222222",
      rg: "7654321",
      celular: "11999990002",
      email: "carlos.cafeicultor@demo.com",
      municipio: "Varginha",
      uf: "MG",
      aceitouLgpd: true,
      ccir: "CCIR-000123",
      nomePropriedade: "Sitio Boa Safra"
    },
    {
      categoria: "VISITANTE",
      nomeCompleto: "Ana Costa",
      cpf: "33333333333",
      rg: "9876543",
      celular: "11999990003",
      email: "ana.visitante@demo.com",
      municipio: "Sao Paulo",
      uf: "SP",
      aceitouLgpd: true
    }
  ];

  for (const item of seeds) {
    await prisma.credenciado.upsert({
      where: { email: item.email },
      update: item,
      create: item
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
