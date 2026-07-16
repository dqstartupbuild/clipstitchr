import type { AccountEmailTemplateKey } from "./AccountEmailTemplateKey";

export function getLoopsAccountTransactionalId(
  templateKey: AccountEmailTemplateKey,
  environment: Readonly<Record<string, string | undefined>>,
) {
  const environmentKey = {
    "account-created": "LOOPS_ACCOUNT_CREATED_TRANSACTIONAL_ID",
    "subscription-status": "LOOPS_SUBSCRIPTION_STATUS_TRANSACTIONAL_ID",
    "credits-updated": "LOOPS_CREDITS_UPDATED_TRANSACTIONAL_ID",
    "payment-alert": "LOOPS_PAYMENT_ALERT_TRANSACTIONAL_ID",
  } as const satisfies Record<AccountEmailTemplateKey, string>;
  const transactionalId = environment[environmentKey[templateKey]]?.trim();

  if (!transactionalId) {
    throw new Error("The approved account email template is not configured.");
  }

  return transactionalId;
}
