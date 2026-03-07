import {
  createInternalUserService,
  listInternalUsersService,
  updateInternalUserActiveService,
  updateInternalUserPermissionsService,
  updateInternalUserService
} from "../services/internalUserService.js";

export async function listInternalUsersHandler(req, res) {
  const items = await listInternalUsersService(req.auth);
  if (items?.error) {
    return res.status(403).json({ error: items.error });
  }
  return res.json({ items });
}

export async function createInternalUserHandler(req, res) {
  const result = await createInternalUserService(req.body || {}, req.auth);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  return res.status(201).json(result.user);
}

export async function updateInternalUserHandler(req, res) {
  const result = await updateInternalUserService(req.params.id, req.body || {}, req.auth);
  if (result.error === "perfil sem permissao para gerenciar usuarios internos") {
    return res.status(403).json({ error: result.error });
  }
  if (result.notFound) {
    return res.status(404).json({ error: "usuario interno nao encontrado" });
  }
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  return res.json(result.user);
}

export async function updateInternalUserActiveHandler(req, res) {
  const ativo = req.body?.ativo;
  if (typeof ativo !== "boolean") {
    return res.status(400).json({ error: "ativo deve ser boolean" });
  }

  const result = await updateInternalUserActiveService(req.params.id, ativo, req.auth);
  if (result.error) {
    return res.status(403).json({ error: result.error });
  }
  if (result.notFound) {
    return res.status(404).json({ error: "usuario interno nao encontrado" });
  }

  return res.json(result.user);
}

export async function updateInternalUserPermissionsHandler(req, res) {
  const result = await updateInternalUserPermissionsService(
    req.params.id,
    req.body?.permissoesCustomizadas || {},
    req.auth
  );
  if (result.error) {
    return res.status(403).json({ error: result.error });
  }
  if (result.notFound) {
    return res.status(404).json({ error: "usuario interno nao encontrado" });
  }

  return res.json(result.user);
}
