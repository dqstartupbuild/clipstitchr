import type { LoopsTransactionalTemplateKey } from "./LoopsTransactionalTemplateKey";

export function isLoopsTransactionalTemplateKey(
  value: string,
): value is LoopsTransactionalTemplateKey {
  return value === "email-confirmation";
}
