import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isValidCnpj,
  isValidCpf,
  isValidEmail,
  isValidFullName,
  isValidPhone,
  isValidUf,
  isValidWebsite,
  normalizeWebsite
} from "../src/utils/documentValidation.js";

describe("documentValidation", () => {
  it("valida CPF com e sem mascara", () => {
    assert.equal(isValidCpf("529.982.247-25"), true);
    assert.equal(isValidCpf("52998224725"), true);
    assert.equal(isValidCpf("52998224724"), false);
    assert.equal(isValidCpf("111.111.111-11"), false);
    assert.equal(isValidCpf(""), false);
  });

  it("valida CNPJ", () => {
    assert.equal(isValidCnpj("11.222.333/0001-81"), true);
    assert.equal(isValidCnpj("11222333000180"), false);
    assert.equal(isValidCnpj("00000000000000"), false);
  });

  it("bloqueia emails de teste", () => {
    assert.equal(isValidEmail("Maria@Empresa.com.br"), true);
    assert.equal(isValidEmail("maria@teste.com"), false);
    assert.equal(isValidEmail("sem-arroba.com"), false);
  });

  it("valida celular com e sem DDI", () => {
    assert.equal(isValidPhone("(11) 99999-0001"), true);
    assert.equal(isValidPhone("+55 11 99999-0001"), true);
    assert.equal(isValidPhone("99999"), false);
    assert.equal(isValidPhone("11111111111"), false);
  });

  it("exige nome e sobrenome", () => {
    assert.equal(isValidFullName("Ana Costa"), true);
    assert.equal(isValidFullName("Ana"), false);
    assert.equal(isValidFullName("fulano de tal"), false);
  });

  it("valida UF e site", () => {
    assert.equal(isValidUf("mg"), true);
    assert.equal(isValidUf("XX"), false);
    assert.equal(normalizeWebsite("empresa.com"), "https://empresa.com");
    assert.equal(isValidWebsite("empresa.com"), true);
    assert.equal(isValidWebsite("localhost"), false);
    assert.equal(isValidWebsite(""), true);
  });
});
