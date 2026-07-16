import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/convex/_generated/api";
import { useBillingWorkspace } from "@/lib/clipstitchr/hooks/useBillingWorkspace";

const mocks = vi.hoisted(() => ({
  checkoutAction: vi.fn(),
  locationAssign: vi.fn(),
  portalAction: vi.fn(),
  refillAction: vi.fn(),
  stateSetter: vi.fn(),
  useAction: vi.fn(),
  useConvexAuth: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock("react", () => ({
  useCallback: (callback: unknown) => callback,
  useState: (initialValue: unknown) => [initialValue, mocks.stateSetter],
}));

vi.mock("convex/react", () => ({
  useAction: mocks.useAction,
  useConvexAuth: mocks.useConvexAuth,
  useQuery: mocks.useQuery,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    billing: {
      getCurrentEntitlement: {
        getCurrentEntitlement: "billing.getCurrentEntitlement",
      },
    },
    stripe: {
      createCreditRefillCheckout: {
        createCreditRefillCheckout: "stripe.createCreditRefillCheckout",
      },
      createPortalSession: {
        createPortalSession: "stripe.createPortalSession",
      },
      createSubscriptionCheckout: {
        createSubscriptionCheckout: "stripe.createSubscriptionCheckout",
      },
    },
    usage: {
      getCurrentUsage: { getCurrentUsage: "usage.getCurrentUsage" },
      getUsageHistory: { getUsageHistory: "usage.getUsageHistory" },
    },
  },
}));

describe("useBillingWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("window", {
      location: { assign: mocks.locationAssign },
    });
    mocks.checkoutAction.mockResolvedValue({ url: "https://checkout.test" });
    mocks.portalAction.mockResolvedValue({ url: "https://portal.test" });
    mocks.refillAction.mockResolvedValue({ url: "https://refill.test" });
    mocks.useAction.mockImplementation((actionId) => {
      if (
        actionId ===
        api.stripe.createSubscriptionCheckout.createSubscriptionCheckout
      ) {
        return mocks.checkoutAction;
      }

      if (actionId === api.stripe.createPortalSession.createPortalSession) {
        return mocks.portalAction;
      }

      return mocks.refillAction;
    });
    mocks.useConvexAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    mocks.useQuery.mockImplementation((queryId) => {
      if (queryId === api.billing.getCurrentEntitlement.getCurrentEntitlement) {
        return null;
      }

      return queryId === api.usage.getUsageHistory.getUsageHistory ? [] : null;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads billing data only after Convex authentication is ready", () => {
    const state = useBillingWorkspace();

    expect(state.isLoading).toBe(false);
    expect(mocks.useQuery).toHaveBeenCalledWith(
      api.billing.getCurrentEntitlement.getCurrentEntitlement,
      {},
    );
    expect(mocks.useQuery).toHaveBeenCalledWith(
      api.usage.getCurrentUsage.getCurrentUsage,
      {},
    );
    expect(mocks.useQuery).toHaveBeenCalledWith(
      api.usage.getUsageHistory.getUsageHistory,
      { limit: 12 },
    );
  });

  it("skips every authenticated billing query during Clerk handoff", () => {
    mocks.useConvexAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });
    mocks.useQuery.mockReturnValue(undefined);

    const state = useBillingWorkspace();

    expect(state.isLoading).toBe(true);
    expect(mocks.useQuery).toHaveBeenCalledWith(
      api.billing.getCurrentEntitlement.getCurrentEntitlement,
      "skip",
    );
    expect(mocks.useQuery).toHaveBeenCalledWith(
      api.usage.getCurrentUsage.getCurrentUsage,
      "skip",
    );
    expect(mocks.useQuery).toHaveBeenCalledWith(
      api.usage.getUsageHistory.getUsageHistory,
      "skip",
    );
  });

  it("starts onboarding Checkout with the selected plan and return target", async () => {
    const state = useBillingWorkspace();

    await state.startPlan("pro", "onboarding");

    expect(mocks.checkoutAction).toHaveBeenCalledWith({
      planKey: "pro",
      returnTarget: "onboarding",
    });
    expect(mocks.stateSetter).toHaveBeenCalledWith({
      action: "checkout",
      planKey: "pro",
    });
    expect(mocks.locationAssign).toHaveBeenCalledWith("https://checkout.test");
  });

  it("opens Stripe's dedicated subscription-update portal flow", async () => {
    const state = useBillingWorkspace();

    await state.manageBilling("subscription_update", "agency");

    expect(mocks.portalAction).toHaveBeenCalledWith({
      flow: "subscription_update",
    });
    expect(mocks.stateSetter).toHaveBeenCalledWith({
      action: "portal",
      planKey: "agency",
    });
    expect(mocks.locationAssign).toHaveBeenCalledWith("https://portal.test");
  });
});
