import {
  createInternalUserService,
  listInternalUsersService,
  updateInternalUserActiveService,
  updateInternalUserPermissionsService,
  updateInternalUserService
} from "../services/internalUserService.js";

function sendInternalUserError(res, result, { badRequestMessage } = {}) {
  if (!result) {
    return false;
  }
  if (result.error === "perfil sem permissao para gerenciar usuarios internos") {
    res.status(403).json({ error: result.error });
    return true;
  }
  if (result.notFound) {
    res.status(404).json({ error: "usuario interno nao encontrado" });
    return true;
  }
  if (result.error) {
    res.status(400).json({ error: badRequestMessage || result.error });
    return true;
  }
  return false;
}

export async function listInternalUsersHandler(req, res) {
  const items = await listInternalUsersService(req.auth);
  if (items?.error) {
    return res.status(403).json({ error: items.error });
  }
  return res.json({ items });
}

export async function createInternalUserHandler(req, res) {
  const result = await createInternalUserService(req.body || {}, req.auth);
  if (sendInternalUserError(res, result)) {
    return;
  }
  return res.status(201).json(result.user);
}

export async function updateInternalUserHandler(req, res) {
  const result = await updateInternalUserService(req.params.id, req.body || {}, req.auth);
  if (sendInternalUserError(res, result)) {
    return;
  }
  return res.json(result.user);
}

export async function updateInternalUserActiveHandler(req, res) {
  const ativo = req.body?.ativo;
  if (typeof ativo !== "boolean") {
    return res.status(400).json({ error: "ativo deve ser boolean" });
  }

  const result = await updateInternalUserActiveService(req.params.id, ativo, req.auth);
  if (sendInternalUserError(res, result, { badRequestMessage: result?.error })) {
    return;
  }

  return res.json(result.user);
}

export async function updateInternalUserPermissionsHandler(req, res) {
  const result = await updateInternalUserPermissionsService(
    req.params.id,
    req.body?.permissoesCustomizadas || {},
    req.auth
  );
  if (sendInternalUserError(res, result, { badRequestMessage: result?.error })) {
    return;
  }

  return res.json(result.user);
}
