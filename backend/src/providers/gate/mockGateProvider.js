import { GateProvider } from "./gateProvider.js";

export class MockGateProvider extends GateProvider {
  async sendAccessDecision({ gateDevice, decision, reason, metadata }) {
    const latencyMs = 20;
    await new Promise((resolve) => setTimeout(resolve, latencyMs));
    return {
      ok: true,
      provider: "MOCK_GATE",
      gateCode: gateDevice?.codigo || null,
      decision,
      reason,
      acknowledgedAt: new Date().toISOString(),
      metadata: metadata || null
    };
  }
}
