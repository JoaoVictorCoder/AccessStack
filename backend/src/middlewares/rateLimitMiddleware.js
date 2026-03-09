const rateLimitStore = new Map();

function now() {
  return Date.now();
}

function parsePositiveInt(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    return fallback;
  }
  return Math.floor(n);
}

function cleanupExpiredEntries() {
  const current = now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt <= current) {
      rateLimitStore.delete(key);
    }
  }
}

setInterval(cleanupExpiredEntries, 60 * 1000).unref();

export function createRateLimiter({
  id,
  windowMs,
  max,
  keyGenerator,
  message = "limite de requisicoes excedido"
}) {
  const safeId = id || "default";
  const safeWindowMs = parsePositiveInt(windowMs, 60 * 1000);
  const safeMax = parsePositiveInt(max, 60);

  return function rateLimiter(req, res, next) {
    const identity = keyGenerator ? keyGenerator(req) : req.ip;
    const key = `${safeId}:${String(identity || "unknown")}`;
    const current = now();
    const existing = rateLimitStore.get(key);

    if (!existing || existing.resetAt <= current) {
      rateLimitStore.set(key, { count: 1, resetAt: current + safeWindowMs });
      return next();
    }

    if (existing.count >= safeMax) {
      const retryAfterSeconds = Math.max(Math.ceil((existing.resetAt - current) / 1000), 1);
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        error: message,
        code: "RATE_LIMIT_EXCEEDED",
        retryAfterSeconds
      });
    }

    existing.count += 1;
    rateLimitStore.set(key, existing);
    return next();
  };
}

export function createAuthLoginRateLimiter() {
  return createRateLimiter({
    id: "auth-login",
    windowMs: parsePositiveInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: parsePositiveInt(process.env.AUTH_RATE_LIMIT_MAX, 10),
    keyGenerator: (req) => {
      const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
      return `${req.ip}:${email || "no-email"}`;
    },
    message: "muitas tentativas de login. tente novamente em alguns minutos"
  });
}

export function createPublicWriteRateLimiter() {
  return createRateLimiter({
    id: "public-write",
    windowMs: parsePositiveInt(process.env.PUBLIC_WRITE_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: parsePositiveInt(process.env.PUBLIC_WRITE_RATE_LIMIT_MAX, 50),
    keyGenerator: (req) => req.ip,
    message: "muitas requisicoes para cadastro publico. tente novamente em alguns minutos"
  });
}

export function createCheckInRateLimiter() {
  return createRateLimiter({
    id: "checkin-write",
    windowMs: parsePositiveInt(process.env.CHECKIN_RATE_LIMIT_WINDOW_MS, 60 * 1000),
    max: parsePositiveInt(process.env.CHECKIN_RATE_LIMIT_MAX, 120),
    keyGenerator: (req) => req.auth?.id || req.ip,
    message: "muitas validacoes de check-in em curto intervalo"
  });
}
