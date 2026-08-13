import { describe, expect, it, vi } from "vitest";
import { getActiveStudioClipsTaskForOwnerProduct } from "./getActiveStudioClipsTaskForOwnerProduct";

function createContext(results: unknown[][]) {
  const take = vi.fn().mockImplementation(async () => results.shift() ?? []);
  const order = vi.fn(() => ({ take }));
  const withIndex = vi.fn((_name, buildRange) => {
    const range = {
      eq: vi.fn().mockReturnThis(),
    };
    buildRange(range);
    return { order };
  });
  return { ctx: { db: { query: vi.fn(() => ({ withIndex })) } }, take };
}

describe("getActiveStudioClipsTaskForOwnerProduct", () => {
  it("finds an active task across processing and queued states", async () => {
    const active = { id: "task_active", status: "queued" };
    const { ctx } = createContext([[], [active]]);
    await expect(
      getActiveStudioClipsTaskForOwnerProduct(ctx as never, {
        ownerId: "owner_1",
        productId: "product_1",
      }),
    ).resolves.toBe(active);
  });

  it("excludes the task being resumed while still detecting another task", async () => {
    const current = { id: "task_current", status: "processing" };
    const other = { id: "task_other", status: "processing" };
    const { ctx, take } = createContext([[current, other], []]);
    await expect(
      getActiveStudioClipsTaskForOwnerProduct(ctx as never, {
        excludeTaskId: "task_current",
        ownerId: "owner_1",
        productId: "product_1",
      }),
    ).resolves.toBe(other);
    expect(take).toHaveBeenCalledWith(2);
  });
});
