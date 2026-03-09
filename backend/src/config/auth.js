export const AUTH_TOKEN_COOKIE = "auth_token";

export function getJwtSecret() {
  const configured = process.env.JWT_SECRET;

  if (configured && configured.length >= 32) {
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET deve ser definido com no minimo 32 caracteres em producao");
  }

  return "acessstack-dev-secret-change-me";
}

export function getJwtExpiresIn() {
  return process.env.JWT_EXPIRES_IN || "8h";
}

export function getCookieOptions() {
  const sameSite = (process.env.AUTH_COOKIE_SAMESITE || "lax").toLowerCase();
  const secure =
    process.env.AUTH_COOKIE_SECURE === "true" || process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    sameSite: ["lax", "strict", "none"].includes(sameSite) ? sameSite : "lax",
    secure,
    path: "/",
    maxAge: 8 * 60 * 60 * 1000
  };
}
