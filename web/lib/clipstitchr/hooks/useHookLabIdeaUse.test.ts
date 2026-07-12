import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/convex/_generated/api";
import { useHookLabIdeaUse } from "@/lib/clipstitchr/hooks/useHookLabIdeaUse";

const mocks = vi.hoisted(() => ({
  useConvexAuth: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock("convex/react", () => ({
  useConvexAuth: mocks.useConvexAuth,
  useQuery: mocks.useQuery,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    hookLabIdeaUses: {
      get: {
        get: "hookLabIdeaUses.get",
      },
    },
  },
}));

describe("useHookLabIdeaUse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useConvexAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it("subscribes to the current use and maps ordered sibling progress", () => {
    mocks.useQuery.mockReturnValue({
      use: {
        completedVariantCount: 1,
        failedVariantCount: 1,
        id: "use_1",
        progress: 2 / 3,
        status: "generating",
        variationCount: 3,
      },
      variants: [
        {
          finishedStitchId: "stitch_1",
          id: "variant_1",
          status: "completed",
          variantIndex: 0,
        },
        {
          id: "variant_2",
          status: "finalizing",
          variantIndex: 1,
        },
        {
          id: "variant_3",
          status: "failed",
          variantIndex: 2,
        },
      ],
    });

    const state = useHookLabIdeaUse("use_1");

    expect(mocks.useQuery).toHaveBeenCalledWith(
      api.hookLabIdeaUses.get.get,
      { id: "use_1" },
    );
    expect(state.isLoading).toBe(false);
    expect(state.progress).toEqual(
      expect.objectContaining({
        completedVariantCount: 1,
        failedVariantCount: 1,
        id: "use_1",
        variationCount: 3,
        variants: [
          expect.objectContaining({
            finishedStitchId: "stitch_1",
            status: "completed",
            variantIndex: 0,
          }),
          expect.objectContaining({
            status: "finalizing",
            variantIndex: 1,
          }),
          expect.objectContaining({
            status: "failed",
            variantIndex: 2,
          }),
        ],
      }),
    );
  });

  it("skips the subscription without an authenticated current use", () => {
    mocks.useConvexAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
    mocks.useQuery.mockReturnValue(undefined);

    const state = useHookLabIdeaUse(undefined);

    expect(mocks.useQuery).toHaveBeenCalledWith(
      api.hookLabIdeaUses.get.get,
      "skip",
    );
    expect(state).toEqual({ isLoading: false, progress: null });
  });
});
