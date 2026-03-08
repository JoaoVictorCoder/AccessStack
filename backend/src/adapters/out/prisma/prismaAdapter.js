// Adapter de persistencia.
// Este arquivo reexporta apenas as funcoes que a camada de aplicacao precisa.
// Ao trocar detalhes do banco, prefira ajustar os repositories e preservar
// estes contratos para evitar impacto em use cases e services.
export {
  createCredenciado,
  findCredenciadoById,
  listCredenciadosPaginated,
  updateCredenciadoById
} from "../../../repositories/credenciadoRepository.js";

export {
  createCredencial,
  findCredencialByCodigoUnico,
  findCredencialById,
  updateCredencialById,
  updateCredencialStatus
} from "../../../repositories/credencialRepository.js";
