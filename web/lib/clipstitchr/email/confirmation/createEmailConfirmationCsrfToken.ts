import { randomBytes } from "node:crypto";

export function createEmailConfirmationCsrfToken() {
  return randomBytes(32).toString("base64url");
}
