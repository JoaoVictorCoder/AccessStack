import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createRateLimiter } from "../src/middlewares/rateLimitMiddleware.js";

function fakeResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

describe("createRateLimiter", () => {
  it("bloqueia apos o limite e informa Retry-After", () => {
    const limiter = createRateLimiter({ id: "test-limit", windowMs: 60_000, max: 2 });
    const req = { ip: "10.0.0.1" };
    let passed = 0;
    const next = () => {
      passed += 1;
    };

    limiter(req, fakeResponse(), next);
    limiter(req, fakeResponse(), next);
    const blocked = fakeResponse();
    limiter(req, blocked, next);

    assert.equal(passed, 2);
    assert.equal(blocked.statusCode, 429);
    assert.equal(blocked.body.code, "RATE_LIMIT_EXCEEDED");
    assert.ok(Number(blocked.headers["Retry-After"]) >= 1);
  });

  it("conta cada identidade separadamente", () => {
    const limiter = createRateLimiter({ id: "test-identity", windowMs: 60_000, max: 1 });
    let passed = 0;
    const next = () => {
      passed += 1;
    };

    limiter({ ip: "10.0.0.2" }, fakeResponse(), next);
    limiter({ ip: "10.0.0.3" }, fakeResponse(), next);

    assert.equal(passed, 2);
  });
});
