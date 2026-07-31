import { beforeEach, describe, expect, it, vi } from "vitest";
import { assertOwnerCanPublishSocial } from "./assertOwnerCanPublishSocial";

const mocks = vi.hoisted(() => ({
  getEffectiveEntitlementForOwner: vi.fn(),
}));

vi.mock("./getEffectiveEntitlementForOwner", () => ({
  getEffectiveEntitlementForOwner: mocks.getEffectiveEntitlementForOwner,
}));

function entitlement(
  state: "active" | "grace" | "inactive",
  overrides: Record<string, unknown> = {},
) {
  return {
    state,
    entitlement: {
      billingReviewRequired: false,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: "2026-09-01T00:00:00.000Z",
      status: "active",
      ...overrides,
    },
  };
}

describe("assertOwnerCanPublishSocial", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(["active", "grace"] as const)(
    "allows %s entitlement publishing",
    async (state) => {
      mocks.getEffectiveEntitlementForOwner.mockResolvedValue(
        entitlement(state),
      );

      await expect(
        assertOwnerCanPublishSocial(
          {} as never,
          "owner_1",
          "2026-08-01T00:00:00.000Z",
        ),
      ).resolves.toMatchObject({ status: "active" });
    },
  );

  it("rejects inactive and expired entitlements", async () => {
    mocks.getEffectiveEntitlementForOwner.mockResolvedValue(
      entitlement("inactive"),
    );

    await expect(
      assertOwnerCanPublishSocial(
        {} as never,
        "owner_1",
        "2026-08-01T00:00:00.000Z",
      ),
    ).rejects.toThrow("subscription needs attention");
  });

  it("rejects new times beyond a cancel-at-period-end cutoff", async () => {
    mocks.getEffectiveEntitlementForOwner.mockResolvedValue(
      entitlement("active", { cancelAtPeriodEnd: true }),
    );

    await expect(
      assertOwnerCanPublishSocial(
        {} as never,
        "owner_1",
        "2026-08-01T00:00:00.000Z",
        "2026-09-01T00:00:00.000Z",
      ),
    ).rejects.toThrow("before your current subscription period ends");
  });

  it("allows a reactivated owner without publishing missed work itself", async () => {
    mocks.getEffectiveEntitlementForOwner
      .mockResolvedValueOnce(entitlement("inactive"))
      .mockResolvedValueOnce(entitlement("active"));

    await expect(
      assertOwnerCanPublishSocial(
        {} as never,
        "owner_1",
        "2026-08-01T00:00:00.000Z",
      ),
    ).rejects.toThrow("subscription needs attention");
    await expect(
      assertOwnerCanPublishSocial(
        {} as never,
        "owner_1",
        "2026-08-02T00:00:00.000Z",
      ),
    ).resolves.toMatchObject({ state: "active" });
  });
});
