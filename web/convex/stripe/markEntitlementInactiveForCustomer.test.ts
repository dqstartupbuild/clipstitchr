import { beforeEach, describe, expect, it, vi } from "vitest";
import { markEntitlementInactiveForCustomer } from "./markEntitlementInactiveForCustomer";

const mocks = vi.hoisted(() => ({
  cancelNeverStartedQueueForOwner: vi.fn(),
  writeEntitlementHistory: vi.fn(),
}));

vi.mock("../workerQueue/cancelNeverStartedQueueForOwner", () => ({
  cancelNeverStartedQueueForOwner: mocks.cancelNeverStartedQueueForOwner,
}));
vi.mock("./writeEntitlementHistory", () => ({
  writeEntitlementHistory: mocks.writeEntitlementHistory,
}));

describe("markEntitlementInactiveForCustomer", () => {
  beforeEach(() => vi.clearAllMocks());

  it("cancels never-started work after customer deletion", async () => {
    const entitlement = {
      _id: "entitlement_1",
      ownerId: "owner_1",
      planKey: "pro",
      sourceEventCreatedAt: 100,
      state: "active",
      version: 2,
    };
    const query = {
      unique: vi.fn(async () => entitlement),
      withIndex: vi.fn(() => query),
    };
    const ctx = {
      db: { patch: vi.fn(), query: vi.fn(() => query) },
    };

    await markEntitlementInactiveForCustomer(ctx as never, {
      customerId: "cus_owner",
      eventCreatedAt: 200,
      eventId: "evt_customer_deleted",
      eventType: "customer.deleted",
      reason: "Stripe customer deleted",
    });

    expect(mocks.cancelNeverStartedQueueForOwner).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ ownerId: "owner_1" }),
    );
  });
});
