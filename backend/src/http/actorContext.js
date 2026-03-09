import { AdminRole, AuditActorType } from "../domain/enums.js";

export function resolveAuditActorType(role) {
  if (
    role === AdminRole.APP_GATE ||
    role === AdminRole.LEITOR_CATRACA ||
    role === AdminRole.OPERADOR_QR
  ) {
    return AuditActorType.APP_GATE;
  }
  return AuditActorType.ADMIN_USER;
}

export function buildActorContextFromAuth(auth, overrides = {}) {
  return {
    actorType: resolveAuditActorType(auth?.role),
    actorId: auth?.id || null,
    actorName: auth?.nome || null,
    actorEmail: auth?.email || null,
    actorRole: auth?.role || null,
    standId: auth?.standId || null,
    standName: auth?.standName || null,
    empresaNome: auth?.empresaNome || null,
    empresaVinculadaId: auth?.empresaVinculadaId || null,
    empresaVinculadaNome: auth?.empresaVinculadaNome || null,
    comissaoResponsavelId: auth?.comissaoResponsavelId || null,
    comissaoResponsavelNome: auth?.comissaoResponsavelNome || null,
    ...overrides
  };
}

export function resolveComissaoScopeFromAuth(auth) {
  if (auth?.role === AdminRole.COMISSAO_ORGANIZADORA) {
    return { comissaoResponsavelId: auth.id };
  }
  return undefined;
}
