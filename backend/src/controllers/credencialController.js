import { findCredencialById } from "../repositories/credencialRepository.js";

export async function getCredencialByIdHandler(req, res) {
  const credencial = await findCredencialById(req.params.id);
  if (!credencial) {
    return res.status(404).json({ error: "credencial nao encontrada" });
  }
  return res.json(credencial);
}
