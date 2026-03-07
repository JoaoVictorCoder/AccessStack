const CATEGORIAS = new Set([
  "EXPOSITOR",
  "CAFEICULTOR",
  "VISITANTE",
  "IMPRENSA",
  "COMISSAO_ORGANIZADORA",
  "COLABORADOR_TERCEIRIZADO"
]);

const categoryFields = {
  EXPOSITOR: ["cnpj", "siteEmpresa", "nomeEmpresa"],
  CAFEICULTOR: ["ccir", "nomePropriedade"],
  VISITANTE: [],
  IMPRENSA: ["cnpj", "nomeVeiculo", "siteEmpresa"],
  COMISSAO_ORGANIZADORA: ["funcaoCargo"],
  COLABORADOR_TERCEIRIZADO: ["cnpj", "nomeEmpresa", "funcaoCargo"]
};

const commonFields = [
  "nomeCompleto",
  "cpf",
  "rg",
  "celular",
  "email",
  "municipio",
  "uf"
];

function getString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateCredenciadoPayload(payload) {
  const errors = [];
  const categoria = getString(payload.categoria);

  if (!CATEGORIAS.has(categoria)) {
    errors.push("categoria invalida");
  }

  for (const field of commonFields) {
    const value = getString(payload[field]);
    if (!value) {
      errors.push(`${field} e obrigatorio`);
    }
  }

  if (getString(payload.uf).length !== 2) {
    errors.push("uf deve ter 2 caracteres");
  }

  if (payload.aceitouLgpd !== true) {
    errors.push("aceitouLgpd deve ser true");
  }

  for (const field of categoryFields[categoria] || []) {
    if (!getString(payload[field])) {
      errors.push(`${field} e obrigatorio para categoria ${categoria}`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      categoria,
      nomeCompleto: getString(payload.nomeCompleto),
      cpf: getString(payload.cpf),
      rg: getString(payload.rg),
      celular: getString(payload.celular),
      email: getString(payload.email),
      municipio: getString(payload.municipio),
      uf: getString(payload.uf).toUpperCase(),
      aceitouLgpd: true,
      cnpj: getString(payload.cnpj) || null,
      siteEmpresa: getString(payload.siteEmpresa) || null,
      nomeEmpresa: getString(payload.nomeEmpresa) || null,
      ccir: getString(payload.ccir) || null,
      nomePropriedade: getString(payload.nomePropriedade) || null,
      nomeVeiculo: getString(payload.nomeVeiculo) || null,
      funcaoCargo: getString(payload.funcaoCargo) || null
    }
  };
}
