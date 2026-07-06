import { randomBytes } from "node:crypto";

export function createCliSessionToken() {
  return `cst_${randomBytes(32).toString("base64url")}`;
}
