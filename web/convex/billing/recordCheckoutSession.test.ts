import { describe, expect, it, vi } from "vitest";
import { recordCheckoutSession } from "./recordCheckoutSession";

type RecordHandler = {
  handler: (
    ctx: unknown,
    args: {
      catalogKey: string;
      checkoutIntentId?: string;
      mode: "subscription" | "payment";
      now: string;
      ownerId: string;
      returnTarget?: "onboarding" | "settings";
      stripeCheckoutSessionId: string;
      stripePriceId?: string;
    },
  ) => Promise<unknown>;
};

vi.mock("../_generated/server", () => ({
  internalMutation: vi.fn((value) => value),
}));

describe("recordCheckoutSession", () => {
  it("attaches Stripe's session to the matching atomic claim", async () => {
    const patch = vi.fn();
    const insert = vi.fn();
    const query = vi
      .fn()
      .mockReturnValueOnce({
        withIndex: vi.fn(() => ({ unique: vi.fn(async () => null) })),
      })
      .mockReturnValueOnce({
        withIndex: vi.fn(() => ({
          unique: vi.fn(async () => ({
            _id: "claim_1",
            catalogKey: "pro",
            checkoutIntentId: "intent_owner",
            mode: "subscription",
            ownerId: "owner_1",
            returnTarget: "onboarding",
            status: "creating",
            stripeCheckoutSessionId: "pending:intent_owner",
          })),
        })),
      });
    const ctx = { db: { insert, patch, query } };

    await expect(
      (recordCheckoutSession as unknown as RecordHandler).handler(ctx, {
        catalogKey: "pro",
        checkoutIntentId: "intent_owner",
        mode: "subscription",
        now: "2026-07-16T12:00:00.000Z",
        ownerId: "owner_1",
        returnTarget: "onboarding",
        stripeCheckoutSessionId: "cs_owner",
        stripePriceId: "price_pro",
      }),
    ).resolves.toBe("claim_1");
    expect(patch).toHaveBeenCalledWith(
      "claim_1",
      expect.objectContaining({
        status: "created",
        stripeCheckoutSessionId: "cs_owner",
        stripePriceId: "price_pro",
      }),
    );
    expect(insert).not.toHaveBeenCalled();
  });
});
