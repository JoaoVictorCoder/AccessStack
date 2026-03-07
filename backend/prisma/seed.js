import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const initialEvents = [
  {
    tipoEvento: "CREDENCIAMENTO_CRIADO",
    descricao: "Credenciamento criado via seed",
    metadata: { source: "seed" }
  },
  {
    tipoEvento: "CREDENCIAL_GERADA",
    descricao: "Credencial gerada via seed",
    metadata: { source: "seed" }
  }
];

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
      nomeEmpresa: "Cafes de Minas",
      statusCredenciamento: "CADASTRADO"
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
      nomePropriedade: "Sitio Boa Safra",
      statusCredenciamento: "CADASTRADO"
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
      aceitouLgpd: true,
      statusCredenciamento: "CADASTRADO"
    }
  ];

  for (const item of seeds) {
    const credenciado = await prisma.credenciado.upsert({
      where: { email: item.email },
      update: item,
      create: item,
      include: { credencial: true }
    });

    const codigoUnico = `SEED-${credenciado.id.slice(0, 8).toUpperCase()}`;

    await prisma.credencial.upsert({
      where: { credenciadoId: credenciado.id },
      update: {
        codigoUnico,
        qrCodePayload: JSON.stringify({
          version: 1,
          credenciadoId: credenciado.id,
          credentialCode: codigoUnico,
          issuedAt: new Date().toISOString()
        }),
        statusCredencial: "GERADA",
        emitidaEm: new Date()
      },
      create: {
        credenciadoId: credenciado.id,
        codigoUnico,
        qrCodePayload: JSON.stringify({
          version: 1,
          credenciadoId: credenciado.id,
          credentialCode: codigoUnico,
          issuedAt: new Date().toISOString()
        }),
        statusCredencial: "GERADA",
        emitidaEm: new Date()
      }
    });

    for (const event of initialEvents) {
      const alreadyExists = await prisma.eventoSistema.findFirst({
        where: {
          credenciadoId: credenciado.id,
          tipoEvento: event.tipoEvento
        }
      });

      if (!alreadyExists) {
        await prisma.eventoSistema.create({
          data: {
            credenciadoId: credenciado.id,
            tipoEvento: event.tipoEvento,
            descricao: event.descricao,
            metadata: event.metadata
          }
        });
      }
    }
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
