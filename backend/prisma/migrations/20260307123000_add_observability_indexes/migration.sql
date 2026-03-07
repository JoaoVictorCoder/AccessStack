-- CreateIndex
CREATE INDEX "Credenciado_categoria_statusCredenciamento_idx"
ON "Credenciado"("categoria", "statusCredenciamento");

-- CreateIndex
CREATE INDEX "EventoSistema_credenciadoId_idx"
ON "EventoSistema"("credenciadoId");

-- CreateIndex
CREATE INDEX "EventoSistema_tipoEvento_idx"
ON "EventoSistema"("tipoEvento");

-- CreateIndex
CREATE INDEX "EventoSistema_createdAt_idx"
ON "EventoSistema"("createdAt");
