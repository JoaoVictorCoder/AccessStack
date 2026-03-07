export const AUTH_TOKEN_COOKIE = "auth_token";

export function getJwtSecret() {
  return process.env.JWT_SECRET || "hackathon-dev-secret-change-me";
}

export function getJwtExpiresIn() {
  return process.env.JWT_EXPIRES_IN || "8h";
}

export function getCookieOptions() {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: 8 * 60 * 60 * 1000
  };
}
