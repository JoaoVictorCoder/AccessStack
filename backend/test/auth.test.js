import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { getJwtSecret } from "../src/config/auth.js";
import { generateCredentialCode } from "../src/utils/codeGenerator.js";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("getJwtSecret", () => {
  it("recusa segredo curto em producao", () => {
    process.env.NODE_ENV = "production";
    process.env.JWT_SECRET = "curto";
    assert.throws(() => getJwtSecret());
  });

  it("usa o segredo configurado quando tem 32+ caracteres", () => {
    process.env.NODE_ENV = "production";
    process.env.JWT_SECRET = "a".repeat(32);
    assert.equal(getJwtSecret(), "a".repeat(32));
  });
});

describe("generateCredentialCode", () => {
  it("gera codigos no formato esperado e sem repeticao", () => {
    const codes = new Set(Array.from({ length: 50 }, generateCredentialCode));
    assert.equal(codes.size, 50);
    for (const code of codes) {
      assert.match(code, /^CRD-\d+-[0-9A-F]{8}$/);
    }
  });
});
