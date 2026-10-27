import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateCheckInRequestDTO } from "../src/validators/checkInValidator.js";
import { validateCredenciadoPayload } from "../src/validators/credenciadoValidator.js";

const visitante = {
  categoria: "VISITANTE",
  nomeCompleto: "Ana Costa",
  cpf: "390.533.447-05",
  celular: "(11) 99999-0003",
  email: "Ana.Visitante@Empresa.com.br",
  municipio: "Sao Paulo",
  uf: "sp",
  nacionalidade: "Brasil",
  aceitouLgpd: true
};

describe("validateCredenciadoPayload", () => {
  it("aceita e normaliza um visitante valido", () => {
    const result = validateCredenciadoPayload(visitante);
    assert.equal(result.valid, true, result.errors?.join("; "));
    assert.equal(result.data.cpf, "39053344705");
    assert.equal(result.data.celular, "11999990003");
    assert.equal(result.data.email, "ana.visitante@empresa.com.br");
    assert.equal(result.data.uf, "SP");
  });

  it("exige aceite da LGPD", () => {
    const result = validateCredenciadoPayload({ ...visitante, aceitouLgpd: false });
    assert.equal(result.valid, false);
    assert.ok(result.errors.includes("aceitouLgpd deve ser true"));
  });

  it("bloqueia COMISSAO_ORGANIZADORA na rota publica", () => {
    const result = validateCredenciadoPayload({
      ...visitante,
      categoria: "COMISSAO_ORGANIZADORA",
      funcaoCargo: "Coordenacao"
    });
    assert.equal(result.valid, false);
    assert.ok(
      result.errors.includes("categoria COMISSAO_ORGANIZADORA nao permitida nesta rota")
    );
  });

  it("exige CNPJ para expositor", () => {
    const result = validateCredenciadoPayload({
      ...visitante,
      categoria: "EXPOSITOR",
      cpf: "",
      nomeEmpresa: "Cafe Brasil Ltda",
      nacionalidadeEmpresa: "Brasil"
    });
    assert.equal(result.valid, false);
    assert.ok(result.errors.includes("Preencha CNPJ para esta categoria"));
  });

  it("dispensa UF para visitante internacional", () => {
    const result = validateCredenciadoPayload({
      ...visitante,
      cpf: "",
      uf: "",
      nacionalidade: "Colombia"
    });
    assert.equal(result.valid, true, result.errors?.join("; "));
  });
});

describe("validateCheckInRequestDTO", () => {
  it("exige codigo e gate", () => {
    const result = validateCheckInRequestDTO({});
    assert.equal(result.valid, false);
    assert.ok(result.errors.includes("codigoUnico e obrigatorio"));
    assert.ok(result.errors.includes("gateCode e obrigatorio"));
  });

  it("filtra deviceInfo e usa gateCode como accessPoint padrao", () => {
    const result = validateCheckInRequestDTO({
      codigoUnico: "  CRD-123-ABCD  ",
      gateCode: "GATE-ENTRADA-01",
      deviceInfo: { userAgent: "x".repeat(500), senha: "nao deve passar" }
    });
    assert.equal(result.valid, true);
    assert.equal(result.data.codigoUnico, "CRD-123-ABCD");
    assert.equal(result.data.accessPoint, "GATE-ENTRADA-01");
    assert.deepEqual(Object.keys(result.data.deviceInfo), ["userAgent"]);
    assert.equal(result.data.deviceInfo.userAgent.length, 200);
  });
});
