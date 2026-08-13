import "server-only";

import { createHash } from "node:crypto";

export function createPublishingSha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}
