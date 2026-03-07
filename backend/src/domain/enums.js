export const Categoria = Object.freeze({
  EXPOSITOR: "EXPOSITOR",
  CAFEICULTOR: "CAFEICULTOR",
  VISITANTE: "VISITANTE",
  IMPRENSA: "IMPRENSA",
  COMISSAO_ORGANIZADORA: "COMISSAO_ORGANIZADORA",
  COLABORADOR_TERCEIRIZADO: "COLABORADOR_TERCEIRIZADO"
});

export const StatusCredenciamento = Object.freeze({
  CADASTRADO: "CADASTRADO",
  APROVADO: "APROVADO",
  BLOQUEADO: "BLOQUEADO",
  CHECKED_IN: "CHECKED_IN"
});

export const StatusCredencial = Object.freeze({
  GERADA: "GERADA",
  ATIVA: "ATIVA",
  INATIVA: "INATIVA",
  UTILIZADA: "UTILIZADA"
});

export const TipoEventoSistema = Object.freeze({
  CREDENCIAMENTO_CRIADO: "CREDENCIAMENTO_CRIADO",
  CREDENCIAL_GERADA: "CREDENCIAL_GERADA",
  DADOS_ATUALIZADOS: "DADOS_ATUALIZADOS",
  ACESSO_VALIDADO: "ACESSO_VALIDADO",
  ACESSO_NEGADO: "ACESSO_NEGADO"
});

export const AdminRole = Object.freeze({
  ADMIN: "ADMIN",
  APP_GATE: "APP_GATE",
  SYSTEM: "SYSTEM"
});

export const AccessResult = Object.freeze({
  ALLOW: "ALLOW",
  DENY: "DENY"
});

export const AccessReason = Object.freeze({
  CREDENCIAL_INVALIDA: "CREDENCIAL_INVALIDA",
  CREDENCIAL_BLOQUEADA: "CREDENCIAL_BLOQUEADA",
  JA_UTILIZADA: "JA_UTILIZADA",
  FORA_DO_HORARIO: "FORA_DO_HORARIO",
  ACESSO_PERMITIDO: "ACESSO_PERMITIDO"
});

export const AuditActorType = Object.freeze({
  ADMIN_USER: "ADMIN_USER",
  APP_GATE: "APP_GATE",
  SYSTEM: "SYSTEM"
});

export const CategoriaCamposObrigatorios = Object.freeze({
  [Categoria.EXPOSITOR]: ["cnpj", "siteEmpresa", "nomeEmpresa"],
  [Categoria.CAFEICULTOR]: ["ccir", "nomePropriedade"],
  [Categoria.VISITANTE]: [],
  [Categoria.IMPRENSA]: ["cnpj", "nomeVeiculo", "siteEmpresa"],
  [Categoria.COMISSAO_ORGANIZADORA]: ["funcaoCargo"],
  [Categoria.COLABORADOR_TERCEIRIZADO]: ["cnpj", "nomeEmpresa", "funcaoCargo"]
});
