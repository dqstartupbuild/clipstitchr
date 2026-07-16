import { describe, expect, it, vi } from "vitest";
import { sendLoopsAccountTransactionalEmail } from "./sendLoopsAccountTransactionalEmail";

describe("sendLoopsAccountTransactionalEmail", () => {
  it("sends a service message without adding the account to marketing", async () => {
    const sendTransactionalEmail = vi.fn(async () => ({ success: true as const }));

    await sendLoopsAccountTransactionalEmail({
      client: { sendTransactionalEmail },
      dataVariables: { headline: "Plan active" },
      idempotencyKey: "account-operation-1",
      recipientEmail: "owner@example.com",
      teamEnvironment: "production",
      transactionalId: "txn_subscription",
    });

    expect(sendTransactionalEmail).toHaveBeenCalledWith({
      addToAudience: false,
      dataVariables: { headline: "Plan active" },
      email: "owner@example.com",
      headers: { "Idempotency-Key": "account-operation-1" },
      transactionalId: "txn_subscription",
    });
  });

  it("rejects a development recipient outside the allowlist", () => {
    expect(() =>
      sendLoopsAccountTransactionalEmail({
        client: { sendTransactionalEmail: vi.fn() },
        dataVariables: {},
        developmentRecipientList: "allowed@example.com",
        idempotencyKey: "account-operation-2",
        recipientEmail: "blocked@example.com",
        teamEnvironment: "development",
        transactionalId: "txn_account",
      }),
    ).toThrow("not configured");
  });
});
