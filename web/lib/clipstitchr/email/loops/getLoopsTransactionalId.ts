import type { LoopsTransactionalTemplateKey } from "./LoopsTransactionalTemplateKey";
import { isLoopsTransactionalTemplateKey } from "./isLoopsTransactionalTemplateKey";

export function getLoopsTransactionalId(
  templateKey: string,
  environment: Readonly<Record<string, string | undefined>>,
) {
  if (!isLoopsTransactionalTemplateKey(templateKey)) {
    throw new Error("The Loops transactional template is not approved.");
  }

  const environmentKey = {
    "email-confirmation": "LOOPS_EMAIL_CONFIRMATION_TRANSACTIONAL_ID",
  } as const satisfies Record<LoopsTransactionalTemplateKey, string>;
  const transactionalId = environment[environmentKey[templateKey]]?.trim();

  if (!transactionalId) {
    throw new Error("The approved Loops transactional template is not configured.");
  }

  return transactionalId;
}
