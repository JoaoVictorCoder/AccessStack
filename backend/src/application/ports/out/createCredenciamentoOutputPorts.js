// Output port contracts are represented by injected adapter functions.
// Adapters de saida exigidos por este fluxo de credenciamento:
// - createCredenciamento(payload, actor)
export function buildCreateCredenciamentoOutputPorts(adapters) {
  return {
    createCredenciamento: adapters.createCredenciamento
  };
}
