import { randomBytes } from "node:crypto";

export function generateCredentialCode() {
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `CRD-${Date.now()}-${suffix}`;
}
