import { buildCreateCredenciamentoOutputPorts } from "../ports/out/createCredenciamentoOutputPorts.js";

export class CreateCredenciamentoUseCase {
  constructor(adapters) {
    this.adapters = buildCreateCredenciamentoOutputPorts(adapters);
  }

  async execute(payload, actor) {
    return this.adapters.createCredenciamento(payload, actor);
  }
}
