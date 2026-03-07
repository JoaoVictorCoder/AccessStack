export class GateProvider {
  // eslint-disable-next-line no-unused-vars
  async sendAccessDecision({ gateDevice, decision, reason, metadata }) {
    throw new Error("GateProvider.sendAccessDecision nao implementado");
  }
}
