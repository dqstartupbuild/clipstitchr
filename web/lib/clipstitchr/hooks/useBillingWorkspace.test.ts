import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/convex/_generated/api";
import { useBillingWorkspace } from "@/lib/clipstitchr/hooks/useBillingWorkspace";

const mocks = vi.hoisted(() => ({
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
    mocks.useAction.mockReturnValue(vi.fn());
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
});
