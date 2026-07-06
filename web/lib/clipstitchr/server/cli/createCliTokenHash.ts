import { createHash } from "node:crypto";

export function createCliTokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
