import { beforeEach, describe, expect, it, vi } from "vitest";
import { assertProductIsUnlockedForOwner } from "./assertProductIsUnlockedForOwner";

const mocks = vi.hoisted(() => ({
  getProductAccessStateForOwner: vi.fn(),
}));

vi.mock("./getProductAccessStateForOwner", () => ({
  getProductAccessStateForOwner: mocks.getProductAccessStateForOwner,
}));

describe("assertProductIsUnlockedForOwner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getProductAccessStateForOwner.mockResolvedValue({
      lockedProductIds: ["locked"],
      planName: "Starter",
      productLimit: 1,
    });
  });

  it("allows a product with a current plan slot", async () => {
    await expect(
      assertProductIsUnlockedForOwner(
        {} as never,
        "owner_1",
        "unlocked",
        "2026-07-16T00:00:00.000Z",
      ),
    ).resolves.toBeUndefined();
  });

  it("returns a structured product-lock error", async () => {
    await expect(
      assertProductIsUnlockedForOwner(
        {} as never,
        "owner_1",
        "locked",
        "2026-07-16T00:00:00.000Z",
      ),
    ).rejects.toMatchObject({
      data: expect.objectContaining({ code: "PRODUCT_LOCKED" }),
    });
  });
});
