-- 20260307170000 e 20260307190000 tem timestamp anterior a 20260308100000,
-- que e onde "AdminRole" e "AccessAttempt" sao criados. Em banco vazio os
-- trechos dependentes sao pulados la e aplicados aqui. Tudo e idempotente,
-- entao bancos que ja tem esses objetos nao sao alterados.
ALTER TYPE "AdminRole" ADD VALUE IF NOT EXISTS 'LEITOR_CATRACA';
ALTER TYPE "AdminRole" ADD VALUE IF NOT EXISTS 'MASTER_ADMIN';
ALTER TYPE "AdminRole" ADD VALUE IF NOT EXISTS 'OPERADOR_QR';

ALTER TABLE "AccessAttempt" ADD COLUMN IF NOT EXISTS "operatorId" UUID;
ALTER TABLE "AccessAttempt" ADD COLUMN IF NOT EXISTS "operatorNome" TEXT;
ALTER TABLE "AccessAttempt" ADD COLUMN IF NOT EXISTS "operatorRole" TEXT;
ALTER TABLE "AccessAttempt" ADD COLUMN IF NOT EXISTS "deviceId" TEXT;
ALTER TABLE "AccessAttempt" ADD COLUMN IF NOT EXISTS "deviceInfo" JSONB;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'AccessAttempt_operatorId_fkey'
      AND table_name = 'AccessAttempt'
  ) THEN
    ALTER TABLE "AccessAttempt"
      ADD CONSTRAINT "AccessAttempt_operatorId_fkey"
      FOREIGN KEY ("operatorId") REFERENCES "AdminUser"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "AccessAttempt_operatorId_createdAt_idx"
  ON "AccessAttempt"("operatorId", "createdAt");

CREATE INDEX IF NOT EXISTS "AccessAttempt_deviceId_createdAt_idx"
  ON "AccessAttempt"("deviceId", "createdAt");
