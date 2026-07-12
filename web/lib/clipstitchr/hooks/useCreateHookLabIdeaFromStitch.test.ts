import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCreateHookLabIdeaFromStitch } from "@/lib/clipstitchr/hooks/useCreateHookLabIdeaFromStitch";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";

const mocks = vi.hoisted(() => ({
  createHookLabIdea: vi.fn(),
  setState: vi.fn(),
}));

vi.mock("react", () => ({
  useCallback: (callback: unknown) => callback,
  useState: (initialValue: unknown) => [initialValue, mocks.setState],
}));

vi.mock("@/lib/clipstitchr/client/createHookLabIdea", () => ({
  createHookLabIdea: mocks.createHookLabIdea,
}));

function createStitch(overrides: Partial<Stitch> = {}): Stitch {
  return {
    createdAt: "2026-07-12T12:00:00.000Z",
    demoClipId: "demo_1",
    demoClipName: "Demo",
    duration: 12,
    height: 1920,
    id: "stitch_1",
    name: "Winning setup",
    productId: "product_1",
    ugcClipId: "ugc_1",
    ugcClipName: "UGC",
    width: 1080,
    ...overrides,
  };
}

describe("useCreateHookLabIdeaFromStitch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createHookLabIdea.mockResolvedValue({ idea: { id: "idea_1" } });
  });

  it("writes a product-scoped Stitch source to Hook Lab", async () => {
    const state = useCreateHookLabIdeaFromStitch();

    await state.createIdeaFromStitch(createStitch());

    expect(mocks.createHookLabIdea).toHaveBeenCalledWith({
      productId: "product_1",
      scope: "product",
      stitchId: "stitch_1",
    });
    expect(mocks.setState).toHaveBeenCalledWith("stitch_1");
    expect(mocks.setState).toHaveBeenLastCalledWith(null);
  });

  it("keeps productless legacy Stitches reusable as shared Ideas", async () => {
    const state = useCreateHookLabIdeaFromStitch();

    await state.createIdeaFromStitch(
      createStitch({ productId: undefined }),
    );

    expect(mocks.createHookLabIdea).toHaveBeenCalledWith({
      productId: undefined,
      scope: "shared",
      stitchId: "stitch_1",
    });
  });
});
