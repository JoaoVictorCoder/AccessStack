import { listEventosSistema } from "../repositories/eventoSistemaRepository.js";

export async function listEventosSistemaHandler(_req, res) {
  const events = await listEventosSistema();
  return res.json(events);
}
