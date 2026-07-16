import { describe, expect, it, vi } from "vitest";
import { getStripeSubscriptionTransitionDisposition } from "./getStripeSubscriptionTransitionDisposition";

function createContext(
  eventType: string,
  state: "active" | "grace" | "inactive",
) {
  const query = {
    unique: vi.fn(async () => ({ eventType, state })),
    withIndex: vi.fn(() => query),
  };

  return { db: { query: vi.fn(() => query) } };
}

const entitlement = {
  sourceEventCreatedAt: 200,
  sourceEventId: "evt_first",
  state: "active" as const,
};

describe("getStripeSubscriptionTransitionDisposition", () => {
  it("accepts a second authoritative subscription snapshot in the same second", async () => {
    await expect(
      getStripeSubscriptionTransitionDisposition(
        createContext("customer.subscription.updated", "active") as never,
        entitlement,
        {
          createdAt: 200,
          eventId: "evt_second",
          eventType: "customer.subscription.updated",
          state: "active",
        },
      ),
    ).resolves.toBe("full");
  });

  it("keeps paid state while accepting an authoritative schedule refresh", async () => {
    await expect(
      getStripeSubscriptionTransitionDisposition(
        createContext("invoice.paid", "active") as never,
        entitlement,
        {
          createdAt: 200,
          eventId: "evt_schedule",
          eventType: "customer.subscription.updated",
          state: "active",
        },
      ),
    ).resolves.toBe("auxiliary");
  });

  it("does not let a subscription refresh alter same-second terminal state", async () => {
    await expect(
      getStripeSubscriptionTransitionDisposition(
        createContext("customer.subscription.deleted", "inactive") as never,
        { ...entitlement, state: "inactive" },
        {
          createdAt: 200,
          eventId: "evt_update",
          eventType: "customer.subscription.updated",
          state: "active",
        },
      ),
    ).resolves.toBe("ignore");
  });
});
