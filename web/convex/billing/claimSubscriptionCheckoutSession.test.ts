import { beforeEach, describe, expect, it, vi } from "vitest";
import { claimSubscriptionCheckoutSession } from "./claimSubscriptionCheckoutSession";

type ClaimHandler = {
  handler: (
    ctx: unknown,
    args: {
      now: string;
      ownerId: string;
      planKey: "starter" | "pro" | "agency";
      returnTarget: "onboarding" | "settings";
    },
  ) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({ createCheckoutIntentId: vi.fn() }));

vi.mock("../_generated/server", () => ({
  internalMutation: vi.fn((value) => value),
}));
vi.mock("../../lib/clipstitchr/billing/createCheckoutIntentId", () => ({
  createCheckoutIntentId: mocks.createCheckoutIntentId,
}));

describe("claimSubscriptionCheckoutSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createCheckoutIntentId.mockReturnValue("intent_owner");
  });

  it("reuses the owner's in-flight subscription claim", async () => {
    const insert = vi.fn();
    const query = vi
      .fn()
      .mockReturnValueOnce({
        withIndex: vi.fn(() => ({
          order: vi.fn(() => ({
            first: vi.fn(async () => ({
              _creationTime: 2,
              catalogKey: "pro",
              checkoutIntentId: "intent_existing",
              createdAt: "2026-07-16T12:00:00.000Z",
              mode: "subscription",
              returnTarget: "onboarding",
              status: "creating",
              stripeCheckoutSessionId: "pending:intent_existing",
            })),
          })),
        })),
      })
      .mockReturnValueOnce({
        withIndex: vi.fn(() => ({
          order: vi.fn(() => ({ first: vi.fn(async () => null) })),
        })),
      });
    const ctx = {
      db: {
        insert,
        query,
      },
    };

    await expect(
      (claimSubscriptionCheckoutSession as unknown as ClaimHandler).handler(
        ctx,
        {
          now: "2026-07-16T12:00:01.000Z",
          ownerId: "owner_1",
          planKey: "pro",
          returnTarget: "onboarding",
        },
      ),
    ).resolves.toMatchObject({
      checkoutIntentId: "intent_existing",
      status: "creating",
    });
    expect(insert).not.toHaveBeenCalled();
  });

  it("atomically records one creating claim when none is active", async () => {
    const insert = vi.fn(async () => "checkout_1");
    const ctx = {
      db: {
        insert,
        query: vi.fn(() => ({
          withIndex: vi.fn(() => ({
            order: vi.fn(() => ({ first: vi.fn(async () => null) })),
          })),
        })),
      },
    };

    await expect(
      (claimSubscriptionCheckoutSession as unknown as ClaimHandler).handler(
        ctx,
        {
          now: "2026-07-16T12:00:00.000Z",
          ownerId: "owner_1",
          planKey: "agency",
          returnTarget: "settings",
        },
      ),
    ).resolves.toMatchObject({
      checkoutIntentId: "intent_owner",
      status: "creating",
      stripeCheckoutSessionId: "pending:intent_owner",
    });
    expect(insert).toHaveBeenCalledWith(
      "billingCheckoutSessions",
      expect.objectContaining({
        catalogKey: "agency",
        checkoutIntentId: "intent_owner",
        ownerId: "owner_1",
        status: "creating",
      }),
    );
  });
});
