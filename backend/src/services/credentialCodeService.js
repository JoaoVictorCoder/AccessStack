import { existsByCodigoUnico } from "../repositories/credencialRepository.js";
import { generateCredentialCode } from "../utils/codeGenerator.js";

export async function generateUniqueCredentialCode(tx, { maxAttempts = 5, errorMessage } = {}) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const code = generateCredentialCode();
    const exists = await existsByCodigoUnico(code, tx);
    if (!exists) {
      return code;
    }
  }

  throw new Error(errorMessage || "nao foi possivel gerar codigo unico da credencial");
}
