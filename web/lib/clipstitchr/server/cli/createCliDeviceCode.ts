import { randomBytes } from "node:crypto";

export function createCliDeviceCode() {
  return randomBytes(32).toString("base64url");
}
