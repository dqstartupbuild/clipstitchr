import { createHash } from "node:crypto";

export function createHookLabIdeaRequestKey(value: string) {
  return `hook-lab-idea:${createHash("sha256").update(value).digest("hex")}`;
}
