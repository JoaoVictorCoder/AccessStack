DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'AdminRole' AND e.enumlabel = 'COMISSAO_ORGANIZADORA'
  ) THEN
    ALTER TYPE "AdminRole" ADD VALUE 'COMISSAO_ORGANIZADORA';
  END IF;
END$$;

ALTER TABLE "AdminUser"
ADD COLUMN IF NOT EXISTS "empresaVinculadaId" TEXT,
ADD COLUMN IF NOT EXISTS "empresaVinculadaNome" TEXT,
ADD COLUMN IF NOT EXISTS "comissaoResponsavelId" UUID;

UPDATE "AdminUser"
SET "empresaVinculadaNome" = COALESCE("empresaVinculadaNome", "empresaNome")
WHERE "empresaVinculadaNome" IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'AdminUser_comissaoResponsavelId_fkey'
  ) THEN
    ALTER TABLE "AdminUser"
    ADD CONSTRAINT "AdminUser_comissaoResponsavelId_fkey"
    FOREIGN KEY ("comissaoResponsavelId") REFERENCES "AdminUser"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END$$;

ALTER TABLE "AccessAttempt"
ADD COLUMN IF NOT EXISTS "empresaVinculadaId" TEXT,
ADD COLUMN IF NOT EXISTS "empresaVinculadaNome" TEXT,
ADD COLUMN IF NOT EXISTS "comissaoResponsavelId" UUID,
ADD COLUMN IF NOT EXISTS "comissaoResponsavelNome" TEXT;

UPDATE "AccessAttempt"
SET "empresaVinculadaNome" = COALESCE("empresaVinculadaNome", "empresaNome")
WHERE "empresaVinculadaNome" IS NULL;

UPDATE "AccessAttempt" aa
SET
  "empresaVinculadaId" = COALESCE(aa."empresaVinculadaId", au."empresaVinculadaId"),
  "empresaVinculadaNome" = COALESCE(aa."empresaVinculadaNome", au."empresaVinculadaNome", au."empresaNome"),
  "comissaoResponsavelId" = COALESCE(aa."comissaoResponsavelId", au."comissaoResponsavelId"),
  "comissaoResponsavelNome" = COALESCE(aa."comissaoResponsavelNome", c."nome")
FROM "AdminUser" au
LEFT JOIN "AdminUser" c ON c."id" = au."comissaoResponsavelId"
WHERE aa."operatorId" = au."id";

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'AccessAttempt_comissaoResponsavelId_fkey'
  ) THEN
    ALTER TABLE "AccessAttempt"
    ADD CONSTRAINT "AccessAttempt_comissaoResponsavelId_fkey"
    FOREIGN KEY ("comissaoResponsavelId") REFERENCES "AdminUser"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS "AdminUser_role_ativo_idx" ON "AdminUser"("role", "ativo");
CREATE INDEX IF NOT EXISTS "AdminUser_comissaoResponsavelId_role_ativo_idx" ON "AdminUser"("comissaoResponsavelId", "role", "ativo");
CREATE INDEX IF NOT EXISTS "AdminUser_empresaVinculadaId_idx" ON "AdminUser"("empresaVinculadaId");
CREATE INDEX IF NOT EXISTS "AdminUser_standId_idx" ON "AdminUser"("standId");

CREATE INDEX IF NOT EXISTS "AccessAttempt_standId_createdAt_idx" ON "AccessAttempt"("standId", "createdAt");
CREATE INDEX IF NOT EXISTS "AccessAttempt_empresaVinculadaId_createdAt_idx" ON "AccessAttempt"("empresaVinculadaId", "createdAt");
CREATE INDEX IF NOT EXISTS "AccessAttempt_comissaoResponsavelId_createdAt_idx" ON "AccessAttempt"("comissaoResponsavelId", "createdAt");