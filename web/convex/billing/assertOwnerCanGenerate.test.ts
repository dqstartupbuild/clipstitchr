import { beforeEach, describe, expect, it, vi } from "vitest";
import { assertOwnerCanGenerate } from "./assertOwnerCanGenerate";

const mocks = vi.hoisted(() => ({
  getEffectiveEntitlementForOwner: vi.fn(),
}));

vi.mock("./getEffectiveEntitlementForOwner", () => ({
  getEffectiveEntitlementForOwner: mocks.getEffectiveEntitlementForOwner,
}));

const activeEntitlement = {
  billingReviewRequired: false,
  planKey: "starter",
  state: "active",
};

describe("assertOwnerCanGenerate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires an entitlement", async () => {
    mocks.getEffectiveEntitlementForOwner.mockResolvedValueOnce(null);

    await expect(
      assertOwnerCanGenerate(
        {} as never,
        "owner_123",
        "2026-07-16T12:00:00.000Z",
      ),
    ).rejects.toMatchObject({
      data: { code: "SUBSCRIPTION_REQUIRED" },
    });
  });

  it("rejects an inactive entitlement", async () => {
    mocks.getEffectiveEntitlementForOwner.mockResolvedValueOnce({
      entitlement: activeEntitlement,
      state: "inactive",
    });

    await expect(
      assertOwnerCanGenerate(
        {} as never,
        "owner_123",
        "2026-07-16T12:00:00.000Z",
      ),
    ).rejects.toMatchObject({
      data: { code: "SUBSCRIPTION_INACTIVE" },
    });
  });

  it("returns an active entitlement", async () => {
    mocks.getEffectiveEntitlementForOwner.mockResolvedValueOnce({
      entitlement: activeEntitlement,
      state: "active",
    });

    await expect(
      assertOwnerCanGenerate(
        {} as never,
        "owner_123",
        "2026-07-16T12:00:00.000Z",
      ),
    ).resolves.toBe(activeEntitlement);
  });
});
