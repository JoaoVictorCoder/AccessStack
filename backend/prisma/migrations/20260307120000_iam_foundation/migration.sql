-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "Categoria" AS ENUM (
  'EXPOSITOR',
  'CAFEICULTOR',
  'VISITANTE',
  'IMPRENSA',
  'COMISSAO_ORGANIZADORA',
  'COLABORADOR_TERCEIRIZADO'
);

-- CreateEnum
CREATE TYPE "StatusCredenciamento" AS ENUM (
  'CADASTRADO',
  'APROVADO',
  'BLOQUEADO',
  'CHECKED_IN'
);

-- CreateEnum
CREATE TYPE "StatusCredencial" AS ENUM (
  'GERADA',
  'ATIVA',
  'INATIVA',
  'UTILIZADA'
);

-- CreateEnum
CREATE TYPE "TipoEventoSistema" AS ENUM (
  'CREDENCIAMENTO_CRIADO',
  'CREDENCIAL_GERADA',
  'DADOS_ATUALIZADOS',
  'ACESSO_VALIDADO',
  'ACESSO_NEGADO'
);

-- CreateTable
CREATE TABLE "Credenciado" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "categoria" "Categoria" NOT NULL,
  "statusCredenciamento" "StatusCredenciamento" NOT NULL DEFAULT 'CADASTRADO',
  "nomeCompleto" TEXT NOT NULL,
  "cpf" TEXT NOT NULL,
  "rg" TEXT NOT NULL,
  "celular" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "municipio" TEXT NOT NULL,
  "uf" TEXT NOT NULL,
  "aceitouLgpd" BOOLEAN NOT NULL,
  "cnpj" TEXT,
  "siteEmpresa" TEXT,
  "nomeEmpresa" TEXT,
  "ccir" TEXT,
  "nomePropriedade" TEXT,
  "nomeVeiculo" TEXT,
  "funcaoCargo" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Credenciado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credencial" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "credenciadoId" UUID NOT NULL,
  "codigoUnico" TEXT NOT NULL,
  "qrCodePayload" TEXT NOT NULL,
  "statusCredencial" "StatusCredencial" NOT NULL DEFAULT 'GERADA',
  "emitidaEm" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Credencial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoSistema" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "credenciadoId" UUID,
  "tipoEvento" "TipoEventoSistema" NOT NULL,
  "descricao" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EventoSistema_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Credenciado_cpf_key" ON "Credenciado"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Credenciado_email_key" ON "Credenciado"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Credencial_credenciadoId_key" ON "Credencial"("credenciadoId");

-- CreateIndex
CREATE UNIQUE INDEX "Credencial_codigoUnico_key" ON "Credencial"("codigoUnico");

-- AddForeignKey
ALTER TABLE "Credencial"
ADD CONSTRAINT "Credencial_credenciadoId_fkey"
FOREIGN KEY ("credenciadoId")
REFERENCES "Credenciado"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoSistema"
ADD CONSTRAINT "EventoSistema_credenciadoId_fkey"
FOREIGN KEY ("credenciadoId")
REFERENCES "Credenciado"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
