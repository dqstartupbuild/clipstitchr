import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPortalSession } from "./createPortalSession";

type PortalSessionHandler = {
  handler: (
    ctx: unknown,
    args: { flow?: "home" | "subscription_update" },
  ) => Promise<{ url: string }>;
};

const mocks = vi.hoisted(() => ({
  createPortalSession: vi.fn(),
  getBillingPortalSessionParams: vi.fn(),
}));

vi.mock("../_generated/server", () => ({ action: vi.fn((value) => value) }));
vi.mock("../_generated/api", () => ({
  components: {
    stripe: {
      public: { getCustomerByUserId: "stripe.getCustomerByUserId" },
    },
  },
  internal: {
    billing: {
      consumePortalSessionRateLimit: {
        consumePortalSessionRateLimit: "billing.consumePortalLimit",
      },
      getEntitlementForOwner: {
        getEntitlementForOwner: "billing.getEntitlementForOwner",
      },
    },
  },
}));
vi.mock("../../lib/clipstitchr/billing/createStripeSdk", () => ({
  createStripeSdk: vi.fn(() => ({
    billingPortal: { sessions: { create: mocks.createPortalSession } },
  })),
}));
vi.mock("../../lib/clipstitchr/billing/getBillingAppUrl", () => ({
  getBillingAppUrl: vi.fn(() => "https://clipstitchr.com"),
}));
vi.mock("../../lib/clipstitchr/billing/getBillingPortalSessionParams", () => ({
  getBillingPortalSessionParams: mocks.getBillingPortalSessionParams,
}));
vi.mock("../../lib/clipstitchr/billing/getStripePortalConfigurationId", () => ({
  getStripePortalConfigurationId: vi.fn(() => "bpc_live"),
}));

describe("createPortalSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getBillingPortalSessionParams.mockReturnValue({
      configuration: "bpc_live",
      customer: "cus_owner",
      return_url: "https://clipstitchr.com/dashboard/settings",
    });
    mocks.createPortalSession.mockResolvedValue({
      url: "https://billing.stripe.test/session",
    });
  });

  it("rate-limits before reading billing state or calling Stripe", async () => {
    const ctx = {
      auth: {
        getUserIdentity: vi.fn(async () => ({ subject: "owner_1" })),
      },
      runMutation: vi.fn(async () => {
        throw new Error("Portal rate limit reached");
      }),
      runQuery: vi.fn(),
    };

    await expect(
      (createPortalSession as unknown as PortalSessionHandler).handler(ctx, {}),
    ).rejects.toThrow("Portal rate limit reached");

    expect(ctx.runMutation).toHaveBeenCalledWith("billing.consumePortalLimit", {
      ownerId: "owner_1",
    });
    expect(ctx.runQuery).not.toHaveBeenCalled();
    expect(mocks.createPortalSession).not.toHaveBeenCalled();
  });

  it("opens the signed-in owner's subscription-update flow", async () => {
    const ctx = {
      auth: {
        getUserIdentity: vi.fn(async () => ({ subject: "owner_1" })),
      },
      runMutation: vi.fn(async () => undefined),
      runQuery: vi.fn(async () => ({
        stripeCustomerId: "cus_owner",
        stripeSubscriptionId: "sub_owner",
      })),
    };

    await expect(
      (createPortalSession as unknown as PortalSessionHandler).handler(ctx, {
        flow: "subscription_update",
      }),
    ).resolves.toEqual({ url: "https://billing.stripe.test/session" });

    expect(ctx.runQuery).toHaveBeenCalledWith(
      "billing.getEntitlementForOwner",
      { ownerId: "owner_1" },
    );
    expect(mocks.getBillingPortalSessionParams).toHaveBeenCalledWith({
      configurationId: "bpc_live",
      customerId: "cus_owner",
      flow: "subscription_update",
      returnUrl: "https://clipstitchr.com/dashboard/settings",
      subscriptionId: "sub_owner",
    });
    expect(mocks.createPortalSession).toHaveBeenCalledOnce();
  });
});
