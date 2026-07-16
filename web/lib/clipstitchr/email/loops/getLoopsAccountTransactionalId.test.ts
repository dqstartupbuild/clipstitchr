import { describe, expect, it } from "vitest";
import { getLoopsAccountTransactionalId } from "./getLoopsAccountTransactionalId";

describe("getLoopsAccountTransactionalId", () => {
  it.each([
    ["account-created", "LOOPS_ACCOUNT_CREATED_TRANSACTIONAL_ID"],
    ["subscription-status", "LOOPS_SUBSCRIPTION_STATUS_TRANSACTIONAL_ID"],
    ["credits-updated", "LOOPS_CREDITS_UPDATED_TRANSACTIONAL_ID"],
    ["payment-alert", "LOOPS_PAYMENT_ALERT_TRANSACTIONAL_ID"],
  ] as const)("maps %s only through its server environment key", (key, envKey) => {
    expect(getLoopsAccountTransactionalId(key, { [envKey]: "txn_123" })).toBe(
      "txn_123",
    );
  });

  it("fails closed without the approved ID", () => {
    expect(() =>
      getLoopsAccountTransactionalId("payment-alert", {}),
    ).toThrow("not configured");
  });
});
