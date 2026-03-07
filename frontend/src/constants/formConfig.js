export const categoriaOptions = [
  { value: "EXPOSITOR", label: "Expositor" },
  { value: "CAFEICULTOR", label: "Cafeicultor" },
  { value: "VISITANTE", label: "Visitante" },
  { value: "IMPRENSA", label: "Imprensa" },
  { value: "COLABORADOR_TERCEIRIZADO", label: "Colaborador Terceirizado" }
];

export const adminComissaoCategoria = {
  value: "COMISSAO_ORGANIZADORA",
  label: "Comissao Organizadora"
};

export const categoryExtraFields = {
  EXPOSITOR: ["cnpj", "siteEmpresa", "nomeEmpresa"],
  CAFEICULTOR: ["ccir", "nomePropriedade"],
  VISITANTE: [],
  IMPRENSA: ["cnpj", "nomeVeiculo", "siteEmpresa"],
  COMISSAO_ORGANIZADORA: ["funcaoCargo"],
  COLABORADOR_TERCEIRIZADO: ["cnpj", "nomeEmpresa", "funcaoCargo"]
};

export const labels = {
  nomeCompleto: "Nome completo",
  cpf: "CPF",
  rg: "RG",
  celular: "Celular",
  email: "E-mail",
  municipio: "Municipio",
  uf: "UF",
  cnpj: "CNPJ",
  siteEmpresa: "Site da empresa",
  nomeEmpresa: "Nome da empresa",
  ccir: "CCIR",
  nomePropriedade: "Nome da propriedade",
  nomeVeiculo: "Nome do veiculo",
  funcaoCargo: "Funcao/Cargo"
};

export const commonFields = [
  "nomeCompleto",
  "cpf",
  "rg",
  "celular",
  "email",
  "municipio",
  "uf"
];

export const baseForm = {
  categoria: "EXPOSITOR",
  nomeCompleto: "",
  cpf: "",
  rg: "",
  celular: "",
  email: "",
  municipio: "",
  uf: "",
  aceitouLgpd: false,
  cnpj: "",
  siteEmpresa: "",
  nomeEmpresa: "",
  ccir: "",
  nomePropriedade: "",
  nomeVeiculo: "",
  funcaoCargo: ""
};
