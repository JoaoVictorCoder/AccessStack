import {
  findCredenciadoById,
  listCredenciados
} from "../repositories/credenciadoRepository.js";
import { listEventosByCredenciadoId } from "../repositories/eventoSistemaRepository.js";
import { createCredenciamento } from "../services/credenciamentoService.js";
import { validateCredenciadoPayload } from "../validators/credenciadoValidator.js";

export async function createCredenciadoHandler(req, res) {
  const validation = validateCredenciadoPayload(req.body || {});
  if (!validation.valid) {
    return res.status(400).json({ errors: validation.errors });
  }

  try {
    const created = await createCredenciamento(validation.data);
    return res.status(201).json(created);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "cpf ou email ja cadastrado" });
    }
    return res.status(500).json({ error: "erro ao criar credenciamento" });
  }
}

export async function listCredenciadosHandler(_req, res) {
  const items = await listCredenciados();
  return res.json(items);
}

export async function getCredenciadoByIdHandler(req, res) {
  const item = await findCredenciadoById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: "credenciado nao encontrado" });
  }
  return res.json(item);
}

export async function listCredenciadoEventosHandler(req, res) {
  const credenciado = await findCredenciadoById(req.params.id);
  if (!credenciado) {
    return res.status(404).json({ error: "credenciado nao encontrado" });
  }
  const events = await listEventosByCredenciadoId(req.params.id);
  return res.json(events);
}
