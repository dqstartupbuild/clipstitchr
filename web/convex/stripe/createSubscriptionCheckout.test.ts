import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSubscriptionCheckout } from "./createSubscriptionCheckout";

type SubscriptionCheckoutHandler = {
  handler: (
    ctx: unknown,
    args: {
      planKey: "starter" | "pro" | "agency";
      replaceCheckoutIntentId?: string;
      returnTarget?: string;
    },
  ) => Promise<{ url: string }>;
};

const mocks = vi.hoisted(() => ({
  assertStripeCatalogEntry: vi.fn(),
  assertStripeCustomerCanStartSubscriptionCheckout: vi.fn(),
  createStripeSubscriptionCheckoutSession: vi.fn(),
  expireCheckoutSession: vi.fn(),
  getEffectiveEntitlementState: vi.fn(),
  getOrCreateCustomer: vi.fn(),
  getStripeCatalogEntry: vi.fn(),
  getSubscriptionCheckoutReturnUrls: vi.fn(),
  retrieveCheckoutSession: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ action: vi.fn((value) => value) }));
vi.mock("../_generated/api", () => ({
  internal: {
    billing: {
      beginSubscriptionCheckoutSessionExpiration: {
        beginSubscriptionCheckoutSessionExpiration:
          "billing.beginCheckoutExpiration",
      },
      consumeSubscriptionCheckoutRateLimit: {
        consumeSubscriptionCheckoutRateLimit: "billing.consumeCheckoutLimit",
      },
      claimSubscriptionCheckoutSession: {
        claimSubscriptionCheckoutSession: "billing.claimCheckout",
      },
      expireSubscriptionCheckoutSession: {
        expireSubscriptionCheckoutSession: "billing.expireCheckout",
      },
      confirmSubscriptionCheckoutSessionReturn: {
        confirmSubscriptionCheckoutSessionReturn: "billing.confirmCheckout",
      },
      getEntitlementForOwner: {
        getEntitlementForOwner: "billing.getEntitlementForOwner",
      },
      recordCheckoutSession: {
        recordCheckoutSession: "billing.recordCheckoutSession",
      },
      retireCompletedSubscriptionCheckoutSessions: {
        retireCompletedSubscriptionCheckoutSessions:
          "billing.retireCompletedCheckouts",
      },
    },
  },
}));
vi.mock("../../lib/clipstitchr/billing/assertStripeCatalogEntry", () => ({
  assertStripeCatalogEntry: mocks.assertStripeCatalogEntry,
}));
vi.mock("./assertStripeCustomerCanStartSubscriptionCheckout", () => ({
  assertStripeCustomerCanStartSubscriptionCheckout:
    mocks.assertStripeCustomerCanStartSubscriptionCheckout,
}));
vi.mock("../../lib/clipstitchr/billing/createStripeSdk", () => ({
  createStripeSdk: vi.fn(() => ({
    checkout: {
      sessions: {
        expire: mocks.expireCheckoutSession,
        retrieve: mocks.retrieveCheckoutSession,
      },
    },
  })),
}));
vi.mock("../../lib/clipstitchr/billing/getBillingAppUrl", () => ({
  getBillingAppUrl: vi.fn(() => "https://clipstitchr.com"),
}));
vi.mock("../../lib/clipstitchr/billing/getEffectiveEntitlementState", () => ({
  getEffectiveEntitlementState: mocks.getEffectiveEntitlementState,
}));
vi.mock("../../lib/clipstitchr/billing/getStripeCatalogEntry", () => ({
  getStripeCatalogEntry: mocks.getStripeCatalogEntry,
}));
vi.mock(
  "../../lib/clipstitchr/billing/getSubscriptionCheckoutReturnUrls",
  () => ({
    getSubscriptionCheckoutReturnUrls: mocks.getSubscriptionCheckoutReturnUrls,
  }),
);
vi.mock("./getStripeComponentClient", () => ({
  getStripeComponentClient: vi.fn(() => ({
    getOrCreateCustomer: mocks.getOrCreateCustomer,
  })),
}));
vi.mock("./createStripeSubscriptionCheckoutSession", () => ({
  createStripeSubscriptionCheckoutSession:
    mocks.createStripeSubscriptionCheckoutSession,
}));

describe("createSubscriptionCheckout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getEffectiveEntitlementState.mockReturnValue("inactive");
    mocks.assertStripeCustomerCanStartSubscriptionCheckout.mockResolvedValue(
      undefined,
    );
    mocks.getStripeCatalogEntry.mockReturnValue({
      catalogKey: "pro",
      priceId: "price_pro",
      productId: "prod_pro",
    });
    mocks.getSubscriptionCheckoutReturnUrls.mockReturnValue({
      cancelUrl:
        "https://clipstitchr.com/dashboard/onboarding?billing=canceled&plan=pro",
      successUrl:
        "https://clipstitchr.com/dashboard/onboarding?billing=success&plan=pro",
    });
    mocks.getOrCreateCustomer.mockResolvedValue({ customerId: "cus_owner" });
    mocks.createStripeSubscriptionCheckoutSession.mockResolvedValue({
      id: "cs_owner",
      status: "open",
      url: "https://checkout.stripe.test/session",
    });
    mocks.retrieveCheckoutSession.mockResolvedValue({
      id: "cs_owner",
      status: "open",
      url: "https://checkout.stripe.test/session",
    });
  });

  it("rate-limits the authenticated owner before any Stripe request", async () => {
    const ctx = {
      auth: {
        getUserIdentity: vi.fn(async () => ({
          email: "owner@example.com",
          name: "Owner",
          subject: "owner_1",
        })),
      },
      runMutation: vi.fn(async () => {
        throw new Error("Checkout rate limit reached");
      }),
      runQuery: vi.fn(async () => null),
    };

    await expect(
      (
        createSubscriptionCheckout as unknown as SubscriptionCheckoutHandler
      ).handler(ctx, { planKey: "pro", returnTarget: "onboarding" }),
    ).rejects.toThrow("Checkout rate limit reached");

    expect(ctx.runMutation).toHaveBeenCalledWith(
      "billing.consumeCheckoutLimit",
      { ownerId: "owner_1" },
    );
    expect(mocks.assertStripeCatalogEntry).not.toHaveBeenCalled();
    expect(mocks.getOrCreateCustomer).not.toHaveBeenCalled();
    expect(
      mocks.createStripeSubscriptionCheckoutSession,
    ).not.toHaveBeenCalled();
  });

  it("scopes Checkout metadata and the recorded session to the signed-in owner", async () => {
    const runMutation = vi.fn(async (name: string) => {
      if (name === "billing.claimCheckout") {
        return {
          catalogKey: "pro",
          checkoutIntentId: "intent_owner",
          createdAt: "2026-07-16T12:00:00.000Z",
          returnTarget: "onboarding",
          status: "creating",
          stripeCheckoutSessionId: "pending:intent_owner",
        };
      }

      return name === "billing.confirmCheckout" ? true : undefined;
    });
    const ctx = {
      auth: {
        getUserIdentity: vi.fn(async () => ({
          email: "owner@example.com",
          name: "Owner",
          subject: "owner_1",
        })),
      },
      runMutation,
      runQuery: vi.fn(async () => null),
    };

    await expect(
      (
        createSubscriptionCheckout as unknown as SubscriptionCheckoutHandler
      ).handler(ctx, { planKey: "pro", returnTarget: "onboarding" }),
    ).resolves.toEqual({ url: "https://checkout.stripe.test/session" });

    expect(runMutation.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.assertStripeCatalogEntry.mock.invocationCallOrder[0],
    );
    expect(mocks.createStripeSubscriptionCheckoutSession).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        customerId: "cus_owner",
        checkoutIntentId: "intent_owner",
        ownerId: "owner_1",
        planKey: "pro",
        priceId: "price_pro",
      }),
    );
    expect(
      mocks.assertStripeCustomerCanStartSubscriptionCheckout,
    ).toHaveBeenCalledWith(expect.anything(), "cus_owner");
    expect(runMutation).toHaveBeenCalledWith(
      "billing.recordCheckoutSession",
      expect.objectContaining({
        ownerId: "owner_1",
        checkoutIntentId: "intent_owner",
        stripeCheckoutSessionId: "cs_owner",
      }),
    );
  });

  it("does not create Checkout when Stripe already has a live subscription", async () => {
    mocks.assertStripeCustomerCanStartSubscriptionCheckout.mockRejectedValueOnce(
      new Error("A Stripe subscription already exists"),
    );
    const ctx = {
      auth: {
        getUserIdentity: vi.fn(async () => ({
          email: "owner@example.com",
          name: "Owner",
          subject: "owner_1",
        })),
      },
      runMutation: vi.fn(async () => undefined),
      runQuery: vi.fn(async () => null),
    };

    await expect(
      (
        createSubscriptionCheckout as unknown as SubscriptionCheckoutHandler
      ).handler(ctx, { planKey: "pro" }),
    ).rejects.toThrow("already exists");

    expect(
      mocks.createStripeSubscriptionCheckoutSession,
    ).not.toHaveBeenCalled();
  });

  it("rechecks Stripe when another Checkout completes between precheck and claim", async () => {
    mocks.assertStripeCustomerCanStartSubscriptionCheckout
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("A Stripe subscription already exists"));
    const ctx = {
      auth: {
        getUserIdentity: vi.fn(async () => ({
          email: "owner@example.com",
          name: "Owner",
          subject: "owner_1",
        })),
      },
      runMutation: vi.fn(async (name: string) =>
        name === "billing.claimCheckout"
          ? {
              catalogKey: "pro",
              checkoutIntentId: "intent_completed",
              createdAt: "2026-07-16T12:00:00.000Z",
              returnTarget: "onboarding",
              status: "completed",
              stripeCheckoutSessionId: "cs_completed",
            }
          : undefined,
      ),
      runQuery: vi.fn(async () => null),
    };

    await expect(
      (
        createSubscriptionCheckout as unknown as SubscriptionCheckoutHandler
      ).handler(ctx, { planKey: "pro", returnTarget: "onboarding" }),
    ).rejects.toThrow("already exists");

    expect(
      mocks.assertStripeCustomerCanStartSubscriptionCheckout,
    ).toHaveBeenCalledTimes(2);
    expect(
      mocks.createStripeSubscriptionCheckoutSession,
    ).not.toHaveBeenCalled();
    expect(ctx.runMutation).not.toHaveBeenCalledWith(
      "billing.retireCompletedCheckouts",
      expect.anything(),
    );
  });

  it("retires completed history only after Stripe confirms no subscription remains", async () => {
    let claimCount = 0;
    const runMutation = vi.fn(async (name: string) => {
      if (name === "billing.confirmCheckout") {
        return true;
      }

      if (name !== "billing.claimCheckout") {
        return name === "billing.retireCompletedCheckouts" ? 1 : undefined;
      }

      claimCount += 1;
      return claimCount === 1
        ? {
            catalogKey: "pro",
            checkoutIntentId: "intent_completed",
            createdAt: "2026-06-16T12:00:00.000Z",
            returnTarget: "onboarding",
            status: "completed",
            stripeCheckoutSessionId: "cs_completed",
          }
        : {
            catalogKey: "pro",
            checkoutIntentId: "intent_new",
            createdAt: "2026-07-16T12:00:00.000Z",
            returnTarget: "onboarding",
            status: "creating",
            stripeCheckoutSessionId: "pending:intent_new",
          };
    });
    const ctx = {
      auth: {
        getUserIdentity: vi.fn(async () => ({
          email: "owner@example.com",
          name: "Owner",
          subject: "owner_1",
        })),
      },
      runMutation,
      runQuery: vi.fn(async () => null),
    };

    await expect(
      (
        createSubscriptionCheckout as unknown as SubscriptionCheckoutHandler
      ).handler(ctx, { planKey: "pro", returnTarget: "onboarding" }),
    ).resolves.toEqual({ url: "https://checkout.stripe.test/session" });

    expect(runMutation).toHaveBeenCalledWith(
      "billing.retireCompletedCheckouts",
      expect.objectContaining({ ownerId: "owner_1" }),
    );
    expect(mocks.createStripeSubscriptionCheckoutSession).toHaveBeenCalledTimes(
      1,
    );
  });

  it("returns the same open Checkout for a repeated concurrent request", async () => {
    const ctx = {
      auth: {
        getUserIdentity: vi.fn(async () => ({
          email: "owner@example.com",
          name: "Owner",
          subject: "owner_1",
        })),
      },
      runMutation: vi.fn(async (name: string) => {
        if (name === "billing.claimCheckout") {
          return {
            catalogKey: "pro",
            checkoutIntentId: "intent_owner",
            createdAt: "2026-07-16T12:00:00.000Z",
            returnTarget: "onboarding",
            status: "handedOff",
            stripeCheckoutSessionId: "cs_owner",
          };
        }

        return name === "billing.confirmCheckout" ? true : undefined;
      }),
      runQuery: vi.fn(async () => null),
    };

    await expect(
      (
        createSubscriptionCheckout as unknown as SubscriptionCheckoutHandler
      ).handler(ctx, { planKey: "pro", returnTarget: "onboarding" }),
    ).resolves.toEqual({ url: "https://checkout.stripe.test/session" });

    expect(mocks.retrieveCheckoutSession).toHaveBeenCalledWith("cs_owner");
    expect(mocks.expireCheckoutSession).not.toHaveBeenCalled();
    expect(ctx.runMutation).not.toHaveBeenCalledWith(
      "billing.expireCheckout",
      expect.anything(),
    );
    expect(
      mocks.createStripeSubscriptionCheckoutSession,
    ).not.toHaveBeenCalled();
  });

  it.each([
    ["settings", "onboarding"],
    ["onboarding", "settings"],
  ] as const)(
    "replaces an open %s Checkout before creating an %s Checkout",
    async (existingReturnTarget, requestedReturnTarget) => {
      let claimCount = 0;
      mocks.retrieveCheckoutSession.mockResolvedValueOnce({
        id: "cs_existing",
        status: "open",
        url: "https://checkout.stripe.test/existing",
      });
      const runMutation = vi.fn(async (name: string) => {
        if (
          name === "billing.beginCheckoutExpiration" ||
          name === "billing.expireCheckout" ||
          name === "billing.confirmCheckout"
        ) {
          return true;
        }

        if (name !== "billing.claimCheckout") {
          return undefined;
        }

        claimCount += 1;

        return claimCount === 1
          ? {
              catalogKey: "pro",
              checkoutIntentId: "intent_existing",
              createdAt: "2026-07-16T12:00:00.000Z",
              returnTarget: existingReturnTarget,
              status: "created",
              stripeCheckoutSessionId: "cs_existing",
            }
          : {
              catalogKey: "pro",
              checkoutIntentId: "intent_replacement",
              createdAt: "2026-07-16T12:00:01.000Z",
              returnTarget: requestedReturnTarget,
              status: "creating",
              stripeCheckoutSessionId: "pending:intent_replacement",
            };
      });
      const ctx = {
        auth: {
          getUserIdentity: vi.fn(async () => ({
            email: "owner@example.com",
            name: "Owner",
            subject: "owner_1",
          })),
        },
        runMutation,
        runQuery: vi.fn(async () => null),
      };

      await expect(
        (
          createSubscriptionCheckout as unknown as SubscriptionCheckoutHandler
        ).handler(ctx, {
          planKey: "pro",
          returnTarget: requestedReturnTarget,
        }),
      ).resolves.toEqual({ url: "https://checkout.stripe.test/session" });

      expect(mocks.retrieveCheckoutSession).toHaveBeenCalledWith("cs_existing");
      expect(mocks.expireCheckoutSession).toHaveBeenCalledWith("cs_existing");
      expect(runMutation).toHaveBeenCalledWith(
        "billing.expireCheckout",
        expect.objectContaining({
          ownerId: "owner_1",
          stripeCheckoutSessionId: "cs_existing",
        }),
      );
      expect(mocks.getSubscriptionCheckoutReturnUrls).toHaveBeenCalledWith({
        appUrl: "https://clipstitchr.com",
        checkoutIntentId: "intent_replacement",
        planKey: "pro",
        returnTarget: requestedReturnTarget,
      });
      expect(
        mocks.createStripeSubscriptionCheckoutSession,
      ).toHaveBeenCalledTimes(1);
    },
  );

  it("does not silently replace a Checkout already handed to the browser", async () => {
    const ctx = {
      auth: {
        getUserIdentity: vi.fn(async () => ({
          email: "owner@example.com",
          name: "Owner",
          subject: "owner_1",
        })),
      },
      runMutation: vi.fn(async (name: string) =>
        name === "billing.claimCheckout"
          ? {
              catalogKey: "pro",
              checkoutIntentId: "intent_onboarding",
              createdAt: "2026-07-16T12:00:00.000Z",
              returnTarget: "onboarding",
              status: "handedOff",
              stripeCheckoutSessionId: "cs_owner",
            }
          : undefined,
      ),
      runQuery: vi.fn(async () => null),
    };

    await expect(
      (
        createSubscriptionCheckout as unknown as SubscriptionCheckoutHandler
      ).handler(ctx, {
        planKey: "pro",
        replaceCheckoutIntentId: "intent_stale",
        returnTarget: "settings",
      }),
    ).rejects.toThrow("Finish or cancel the Checkout already open");

    expect(mocks.expireCheckoutSession).not.toHaveBeenCalled();
    expect(ctx.runMutation).not.toHaveBeenCalledWith(
      "billing.beginCheckoutExpiration",
      expect.anything(),
    );
  });

  it("replaces only the exact Checkout named by a canceled return", async () => {
    let claimCount = 0;
    const runMutation = vi.fn(async (name: string) => {
      if (
        name === "billing.beginCheckoutExpiration" ||
        name === "billing.expireCheckout" ||
        name === "billing.confirmCheckout"
      ) {
        return true;
      }

      if (name !== "billing.claimCheckout") {
        return undefined;
      }

      claimCount += 1;
      return claimCount === 1
        ? {
            catalogKey: "pro",
            checkoutIntentId: "intent_canceled",
            createdAt: "2026-07-16T12:00:00.000Z",
            returnTarget: "onboarding",
            status: "handedOff",
            stripeCheckoutSessionId: "cs_owner",
          }
        : {
            catalogKey: "agency",
            checkoutIntentId: "intent_replacement",
            createdAt: "2026-07-16T12:00:01.000Z",
            returnTarget: "onboarding",
            status: "creating",
            stripeCheckoutSessionId: "pending:intent_replacement",
          };
    });
    const ctx = {
      auth: {
        getUserIdentity: vi.fn(async () => ({
          email: "owner@example.com",
          name: "Owner",
          subject: "owner_1",
        })),
      },
      runMutation,
      runQuery: vi.fn(async () => null),
    };

    await expect(
      (
        createSubscriptionCheckout as unknown as SubscriptionCheckoutHandler
      ).handler(ctx, {
        planKey: "agency",
        replaceCheckoutIntentId: "intent_canceled",
        returnTarget: "onboarding",
      }),
    ).resolves.toEqual({ url: "https://checkout.stripe.test/session" });

    expect(runMutation).toHaveBeenCalledWith(
      "billing.beginCheckoutExpiration",
      expect.objectContaining({ allowHandedOff: true }),
    );
    expect(mocks.expireCheckoutSession).toHaveBeenCalledWith("cs_owner");
  });

  it("never returns a newly created URL when the handoff loses expiration", async () => {
    const runMutation = vi.fn(async (name: string) => {
      if (name === "billing.claimCheckout") {
        return {
          catalogKey: "pro",
          checkoutIntentId: "intent_owner",
          createdAt: "2026-07-16T12:00:00.000Z",
          returnTarget: "onboarding",
          status: "creating",
          stripeCheckoutSessionId: "pending:intent_owner",
        };
      }

      return name === "billing.confirmCheckout" ? false : undefined;
    });
    const ctx = {
      auth: {
        getUserIdentity: vi.fn(async () => ({
          email: "owner@example.com",
          name: "Owner",
          subject: "owner_1",
        })),
      },
      runMutation,
      runQuery: vi.fn(async () => null),
    };

    await expect(
      (
        createSubscriptionCheckout as unknown as SubscriptionCheckoutHandler
      ).handler(ctx, { planKey: "pro", returnTarget: "onboarding" }),
    ).rejects.toThrow("Checkout changed while it was opening");

    expect(mocks.createStripeSubscriptionCheckoutSession).toHaveBeenCalled();
  });

  it("does not reuse an in-progress Checkout for a different return target", async () => {
    const ctx = {
      auth: {
        getUserIdentity: vi.fn(async () => ({
          email: "owner@example.com",
          name: "Owner",
          subject: "owner_1",
        })),
      },
      runMutation: vi.fn(async (name: string) =>
        name === "billing.claimCheckout"
          ? {
              catalogKey: "pro",
              checkoutIntentId: "intent_settings",
              createdAt: new Date().toISOString(),
              returnTarget: "settings",
              status: "creating",
              stripeCheckoutSessionId: "pending:intent_settings",
            }
          : undefined,
      ),
      runQuery: vi.fn(async () => null),
    };

    await expect(
      (
        createSubscriptionCheckout as unknown as SubscriptionCheckoutHandler
      ).handler(ctx, { planKey: "pro", returnTarget: "onboarding" }),
    ).rejects.toThrow(
      "Another Checkout is opening now. Try again in a moment.",
    );

    expect(mocks.getSubscriptionCheckoutReturnUrls).not.toHaveBeenCalled();
    expect(
      mocks.createStripeSubscriptionCheckoutSession,
    ).not.toHaveBeenCalled();
  });
});
