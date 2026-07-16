import { beforeEach, describe, expect, it, vi } from "vitest";
import { processAccountEmailOperation } from "./processAccountEmailOperation";

const mocks = vi.hoisted(() => ({
  getReadiness: vi.fn(),
  send: vi.fn(),
}));

vi.mock("../_generated/server", () => ({
  internalAction: vi.fn((definition) => definition),
}));
vi.mock("../../lib/clipstitchr/email/loops/createLoopsClient", () => ({
  createLoopsClient: vi.fn(() => ({})),
}));
vi.mock(
  "../../lib/clipstitchr/email/loops/getLoopsAccountEmailReadiness",
  () => ({ getLoopsAccountEmailReadiness: mocks.getReadiness }),
);
vi.mock(
  "../../lib/clipstitchr/email/loops/getLoopsAccountTransactionalId",
  () => ({ getLoopsAccountTransactionalId: vi.fn(() => "txn_subscription") }),
);
vi.mock(
  "../../lib/clipstitchr/email/loops/sendLoopsAccountTransactionalEmail",
  () => ({ sendLoopsAccountTransactionalEmail: mocks.send }),
);
vi.mock("../../lib/resolveSiteUrl", () => ({
  resolveSiteUrl: vi.fn(() => "https://clipstitchr.com"),
}));

type ActionHandler = {
  handler: (
    ctx: unknown,
    args: { operationId: string },
  ) => Promise<unknown>;
};

describe("processAccountEmailOperation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getReadiness.mockReturnValue({
      dispatchEnabled: true,
      teamEnvironment: "production",
    });
  });

  it("holds a due operation without a provider call when disabled", async () => {
    mocks.getReadiness.mockReturnValue({
      dispatchEnabled: false,
      teamEnvironment: "production",
    });
    const ctx = { runMutation: vi.fn(), runQuery: vi.fn() };

    await expect(
      (processAccountEmailOperation as unknown as ActionHandler).handler(ctx, {
        operationId: "operation_1",
      }),
    ).resolves.toEqual({ processed: false, reason: "provider-disabled" });
    expect(ctx.runMutation).toHaveBeenCalledOnce();
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("injects only trusted common variables and records acceptance", async () => {
    const now = Date.now();
    const ctx = {
      runMutation: vi
        .fn()
        .mockResolvedValueOnce({ _id: "operation_1" })
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({
          attemptCount: 1,
          idempotencyExpiresAt: now + 60_000,
          started: true,
        })
        .mockResolvedValueOnce({ recorded: true }),
      runQuery: vi.fn(async () => ({
        contact: {
          firstName: "Owner",
          normalizedEmail: "owner@example.com",
        },
        operation: {
          dataVariables: {
            effectiveDate: "2026-07-16",
            headline: "Your Agency plan is active",
            planName: "Agency",
            summary: "Agency is ready.",
          },
          operationId: "operation_1",
          ownerId: "user_123",
          templateKey: "subscription-status",
        },
      })),
    };

    await expect(
      (processAccountEmailOperation as unknown as ActionHandler).handler(ctx, {
        operationId: "operation_1",
      }),
    ).resolves.toEqual({ processed: true });
    expect(mocks.send).toHaveBeenCalledWith(
      expect.objectContaining({
        dataVariables: {
          effectiveDate: "2026-07-16",
          firstName: "Owner",
          headline: "Your Agency plan is active",
          planName: "Agency",
          settingsUrl:
            "https://clipstitchr.com/dashboard/settings#plan-and-usage",
          summary: "Agency is ready.",
          supportEmail: "support@followusai.com",
        },
        idempotencyKey: "acct:operation_1",
        recipientEmail: "owner@example.com",
      }),
    );
  });
});
