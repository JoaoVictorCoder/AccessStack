export function mapCredencialSummary(credencial) {
  if (!credencial) {
    return null;
  }

  return {
    id: credencial.id,
    codigoUnico: credencial.codigoUnico,
    statusCredencial: credencial.statusCredencial,
    emitidaEm: credencial.emitidaEm,
    createdAt: credencial.createdAt,
    updatedAt: credencial.updatedAt
  };
}

function maskCpf(cpf) {
  const digits = (cpf || "").replace(/\D/g, "");
  if (digits.length < 4) {
    return "***";
  }
  return `***.***.***-${digits.slice(-2)}`;
}

export function mapCredenciadoIdentity(credenciado) {
  if (!credenciado) {
    return null;
  }

  return {
    id: credenciado.id,
    categoria: credenciado.categoria,
    statusCredenciamento: credenciado.statusCredenciamento,
    nomeCompleto: credenciado.nomeCompleto,
    cpf: credenciado.cpf,
    rg: credenciado.rg,
    celular: credenciado.celular,
    email: credenciado.email,
    municipio: credenciado.municipio,
    uf: credenciado.uf,
    aceitouLgpd: credenciado.aceitouLgpd,
    cnpj: credenciado.cnpj,
    siteEmpresa: credenciado.siteEmpresa,
    nomeEmpresa: credenciado.nomeEmpresa,
    ccir: credenciado.ccir,
    nomePropriedade: credenciado.nomePropriedade,
    nomeVeiculo: credenciado.nomeVeiculo,
    funcaoCargo: credenciado.funcaoCargo,
    createdAt: credenciado.createdAt,
    updatedAt: credenciado.updatedAt,
    credencial: mapCredencialSummary(credenciado.credencial)
  };
}

export function mapPublicCredenciamentoResult(credenciado) {
  return {
    id: credenciado.id,
    nomeCompleto: credenciado.nomeCompleto,
    categoria: credenciado.categoria,
    statusCredenciamento: credenciado.statusCredenciamento,
    aceitouLgpd: credenciado.aceitouLgpd,
    credencial: credenciado.credencial
      ? {
          id: credenciado.credencial.id,
          codigoUnico: credenciado.credencial.codigoUnico,
          statusCredencial: credenciado.credencial.statusCredencial,
          emitidaEm: credenciado.credencial.emitidaEm
        }
      : null,
    createdAt: credenciado.createdAt
  };
}

export function toPublicCredenciadoResponseDTO(credenciado) {
  return mapPublicCredenciamentoResult(credenciado);
}

export function mapAdminCredenciadoListItem(credenciado) {
  return {
    id: credenciado.id,
    nomeCompleto: credenciado.nomeCompleto,
    categoria: credenciado.categoria,
    email: credenciado.email,
    celular: credenciado.celular,
    municipio: credenciado.municipio,
    uf: credenciado.uf,
    aceitouLgpd: credenciado.aceitouLgpd,
    cpfMascarado: maskCpf(credenciado.cpf),
    statusCredenciamento: credenciado.statusCredenciamento,
    createdAt: credenciado.createdAt,
    credencial: mapCredencialSummary(credenciado.credencial)
  };
}

export function toAdminCredenciadoResponseDTO(credenciado) {
  return mapCredenciadoIdentity(credenciado);
}

export function mapCredencialDetail(credencial) {
  if (!credencial) {
    return null;
  }

  return {
    id: credencial.id,
    codigoUnico: credencial.codigoUnico,
    qrCodePayload: credencial.qrCodePayload,
    statusCredencial: credencial.statusCredencial,
    emitidaEm: credencial.emitidaEm,
    createdAt: credencial.createdAt,
    updatedAt: credencial.updatedAt,
    credenciado: credencial.credenciado
      ? mapCredenciadoIdentity(credencial.credenciado)
      : null
  };
}

export function mapEventoSistema(evento) {
  return {
    id: evento.id,
    credenciadoId: evento.credenciadoId,
    tipoEvento: evento.tipoEvento,
    descricao: evento.descricao,
    metadata: evento.metadata,
    createdAt: evento.createdAt,
    credenciado: evento.credenciado
      ? {
          id: evento.credenciado.id,
          nomeCompleto: evento.credenciado.nomeCompleto,
          categoria: evento.credenciado.categoria,
          statusCredenciamento: evento.credenciado.statusCredenciamento
        }
      : null
  };
}

export function toCheckInResponseDTO({
  allowed,
  reason,
  credencialId,
  codigoUnico,
  credenciado
}) {
  return {
    resultado: allowed ? "ALLOW" : "DENY",
    motivo: reason,
    credencialId: credencialId || null,
    codigoUnico: codigoUnico || null,
    credenciado: credenciado
      ? {
          id: credenciado.id,
          nomeCompleto: credenciado.nomeCompleto,
          categoria: credenciado.categoria,
          statusCredenciamento: credenciado.statusCredenciamento
        }
      : null,
    validatedAt: new Date().toISOString()
  };
}

export function toAuditLogResponseDTO(item) {
  return {
    id: item.id,
    actorType: item.actorType,
    actor: item.actor
      ? {
          id: item.actor.id,
          nome: item.actor.nome,
          email: item.actor.email,
          role: item.actor.role
        }
      : null,
    acao: item.acao,
    recurso: item.recurso,
    recursoId: item.recursoId,
    detalhes: item.detalhes,
    createdAt: item.createdAt
  };
}

export function toFraudInsightDTO({
  type,
  severity,
  message,
  credencialId,
  gateDeviceId,
  count
}) {
  return {
    type,
    severity,
    message,
    credencialId: credencialId || null,
    gateDeviceId: gateDeviceId || null,
    count: count || 0
  };
}
