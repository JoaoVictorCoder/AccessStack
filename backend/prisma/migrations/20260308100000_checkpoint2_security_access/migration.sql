-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'APP_GATE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AccessResult" AS ENUM ('ALLOW', 'DENY');

-- CreateEnum
CREATE TYPE "AccessReason" AS ENUM (
  'CREDENCIAL_INVALIDA',
  'CREDENCIAL_BLOQUEADA',
  'JA_UTILIZADA',
  'FORA_DO_HORARIO',
  'ACESSO_PERMITIDO'
);

-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('ADMIN_USER', 'APP_GATE', 'SYSTEM');

-- AlterTable
ALTER TABLE "AdminUser"
ADD COLUMN "role" "AdminRole" NOT NULL DEFAULT 'ADMIN';

-- CreateTable
CREATE TABLE "AuditLog" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "actorType" "AuditActorType" NOT NULL,
  "actorId" UUID,
  "acao" TEXT NOT NULL,
  "recurso" TEXT NOT NULL,
  "recursoId" TEXT,
  "detalhes" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GateDevice" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "codigo" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "localizacao" TEXT,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GateDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessAttempt" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "credencialId" UUID,
  "gateDeviceId" UUID,
  "accessPoint" TEXT,
  "resultado" "AccessResult" NOT NULL,
  "motivo" "AccessReason" NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AccessAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_actorType_createdAt_idx" ON "AuditLog"("actorType", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_recurso_recursoId_idx" ON "AuditLog"("recurso", "recursoId");

-- CreateIndex
CREATE UNIQUE INDEX "GateDevice_codigo_key" ON "GateDevice"("codigo");

-- CreateIndex
CREATE INDEX "AccessAttempt_credencialId_createdAt_idx" ON "AccessAttempt"("credencialId", "createdAt");

-- CreateIndex
CREATE INDEX "AccessAttempt_resultado_motivo_createdAt_idx" ON "AccessAttempt"("resultado", "motivo", "createdAt");

-- AddForeignKey
ALTER TABLE "AuditLog"
ADD CONSTRAINT "AuditLog_actorId_fkey"
FOREIGN KEY ("actorId")
REFERENCES "AdminUser"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessAttempt"
ADD CONSTRAINT "AccessAttempt_credencialId_fkey"
FOREIGN KEY ("credencialId")
REFERENCES "Credencial"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessAttempt"
ADD CONSTRAINT "AccessAttempt_gateDeviceId_fkey"
FOREIGN KEY ("gateDeviceId")
REFERENCES "GateDevice"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
