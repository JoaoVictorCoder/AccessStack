import {
  AUTH_TOKEN_COOKIE,
  getCookieOptions
} from "../config/auth.js";
import { authenticateAdmin } from "../services/adminAuthService.js";
import { logAdminAction } from "../services/auditLogService.js";

export async function loginAdminHandler(req, res) {
  const email = typeof req.body?.email === "string" ? req.body.email : "";
  const senha = typeof req.body?.senha === "string" ? req.body.senha : "";

  if (!email.trim() || !senha.trim()) {
    return res.status(400).json({ error: "email e senha sao obrigatorios" });
  }

  const auth = await authenticateAdmin({ email, senha });
  if (!auth) {
    return res.status(401).json({ error: "credenciais invalidas" });
  }

  res.cookie(AUTH_TOKEN_COOKIE, auth.token, getCookieOptions());
  await logAdminAction({
    actorId: auth.admin.id,
    acao: "LOGIN_SUCESSO",
    recurso: "AUTH"
  });
  return res.json({ admin: auth.admin });
}

export async function meAdminHandler(req, res) {
  return res.json({ admin: req.auth });
}

export async function logoutAdminHandler(_req, res) {
  res.clearCookie(AUTH_TOKEN_COOKIE, getCookieOptions());
  return res.json({ ok: true });
}
