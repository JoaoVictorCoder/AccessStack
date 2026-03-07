import { Categoria, CategoriaCamposObrigatorios } from "../domain/enums.js";

const categorias = new Set(Object.values(Categoria));
const commonFields = [
  "nomeCompleto",
  "cpf",
  "rg",
  "celular",
  "email",
  "municipio",
  "uf"
];

function toCleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateCredenciadoPayload(payload, options = {}) {
  const allowComissaoOrganizadora = options.allowComissaoOrganizadora === true;
  const errors = [];
  const categoria = toCleanString(payload.categoria);

  if (!categorias.has(categoria)) {
    errors.push("categoria invalida");
  }

  if (
    categoria === Categoria.COMISSAO_ORGANIZADORA &&
    !allowComissaoOrganizadora
  ) {
    errors.push("categoria COMISSAO_ORGANIZADORA nao permitida nesta rota");
  }

  for (const field of commonFields) {
    if (!toCleanString(payload[field])) {
      errors.push(`${field} e obrigatorio`);
    }
  }

  if (toCleanString(payload.uf).length !== 2) {
    errors.push("uf deve ter 2 caracteres");
  }

  if (payload.aceitouLgpd !== true) {
    errors.push("aceitouLgpd deve ser true");
  }

  for (const field of CategoriaCamposObrigatorios[categoria] || []) {
    if (!toCleanString(payload[field])) {
      errors.push(`${field} e obrigatorio para categoria ${categoria}`);
    }
  }

  if (errors.length) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      categoria,
      nomeCompleto: toCleanString(payload.nomeCompleto),
      cpf: toCleanString(payload.cpf),
      rg: toCleanString(payload.rg),
      celular: toCleanString(payload.celular),
      email: toCleanString(payload.email),
      municipio: toCleanString(payload.municipio),
      uf: toCleanString(payload.uf).toUpperCase(),
      aceitouLgpd: true,
      cnpj: toCleanString(payload.cnpj) || null,
      siteEmpresa: toCleanString(payload.siteEmpresa) || null,
      nomeEmpresa: toCleanString(payload.nomeEmpresa) || null,
      ccir: toCleanString(payload.ccir) || null,
      nomePropriedade: toCleanString(payload.nomePropriedade) || null,
      nomeVeiculo: toCleanString(payload.nomeVeiculo) || null,
      funcaoCargo: toCleanString(payload.funcaoCargo) || null
    }
  };
}
