import type { AccountEmailTemplateKey } from "./AccountEmailTemplateKey";

export function getAccountEmailTemplateKeyForTransactionalId(
  transactionalId: string | null,
  environment: Readonly<Record<string, string | undefined>>,
): AccountEmailTemplateKey | null {
  if (!transactionalId) {
    return null;
  }

  const mappings = [
    ["account-created", environment.LOOPS_ACCOUNT_CREATED_TRANSACTIONAL_ID],
    [
      "subscription-status",
      environment.LOOPS_SUBSCRIPTION_STATUS_TRANSACTIONAL_ID,
    ],
    ["credits-updated", environment.LOOPS_CREDITS_UPDATED_TRANSACTIONAL_ID],
    ["payment-alert", environment.LOOPS_PAYMENT_ALERT_TRANSACTIONAL_ID],
  ] as const satisfies readonly (readonly [
    AccountEmailTemplateKey,
    string | undefined,
  ])[];
  const match = mappings.find(
    ([, configuredId]) => configuredId?.trim() === transactionalId,
  );

  return match?.[0] ?? null;
}
