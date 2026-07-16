import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSubscriptionCheckout } from "./createSubscriptionCheckout";

type SubscriptionCheckoutHandler = {
  handler: (
    ctx: unknown,
    args: { planKey: "starter" | "pro" | "agency"; returnTarget?: string },
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
      consumeSubscriptionCheckoutRateLimit: {
        consumeSubscriptionCheckoutRateLimit: "billing.consumeCheckoutLimit",
      },
      claimSubscriptionCheckoutSession: {
        claimSubscriptionCheckoutSession: "billing.claimCheckout",
      },
      expireSubscriptionCheckoutSession: {
        expireSubscriptionCheckoutSession: "billing.expireCheckout",
      },
      getEntitlementForOwner: {
        getEntitlementForOwner: "billing.getEntitlementForOwner",
      },
      recordCheckoutSession: {
        recordCheckoutSession: "billing.recordCheckoutSession",
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
    const runMutation = vi.fn(async (name: string) =>
      name === "billing.claimCheckout"
        ? {
            catalogKey: "pro",
            checkoutIntentId: "intent_owner",
            createdAt: "2026-07-16T12:00:00.000Z",
            returnTarget: "onboarding",
            status: "creating",
            stripeCheckoutSessionId: "pending:intent_owner",
          }
        : undefined,
    );
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
    expect(runMutation).toHaveBeenLastCalledWith(
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

  it("returns the same open Checkout for a repeated concurrent request", async () => {
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
              checkoutIntentId: "intent_owner",
              createdAt: "2026-07-16T12:00:00.000Z",
              returnTarget: "onboarding",
              status: "created",
              stripeCheckoutSessionId: "cs_owner",
            }
          : undefined,
      ),
      runQuery: vi.fn(async () => null),
    };

    await expect(
      (
        createSubscriptionCheckout as unknown as SubscriptionCheckoutHandler
      ).handler(ctx, { planKey: "pro", returnTarget: "onboarding" }),
    ).resolves.toEqual({ url: "https://checkout.stripe.test/session" });

    expect(mocks.retrieveCheckoutSession).toHaveBeenCalledWith("cs_owner");
    expect(
      mocks.createStripeSubscriptionCheckoutSession,
    ).not.toHaveBeenCalled();
  });
});
