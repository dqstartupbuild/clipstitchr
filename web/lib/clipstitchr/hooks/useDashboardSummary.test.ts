import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDashboardSummary } from "@/lib/clipstitchr/hooks/useDashboardSummary";
import { api } from "@/convex/_generated/api";

const mocks = vi.hoisted(() => ({
  createStitchFromConvexDocument: vi.fn(),
  createSwiprBackgroundAssetFromConvexDocument: vi.fn(),
  createSwiprSwipeFromConvexDocument: vi.fn(),
  createVideoClipMetadataFromConvexDocument: vi.fn(),
  useConvexAuth: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock("react", () => ({
  useMemo: (factory: () => unknown) => factory(),
}));

vi.mock("convex/react", () => ({
  useConvexAuth: mocks.useConvexAuth,
  useQuery: mocks.useQuery,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    dashboardSummary: {
      get: "dashboardSummary.get",
    },
  },
}));

vi.mock("@/lib/clipstitchr/backend/createStitchFromConvexDocument", () => ({
  createStitchFromConvexDocument: mocks.createStitchFromConvexDocument,
}));

vi.mock(
  "@/lib/clipstitchr/backend/createSwiprBackgroundAssetFromConvexDocument",
  () => ({
    createSwiprBackgroundAssetFromConvexDocument:
      mocks.createSwiprBackgroundAssetFromConvexDocument,
  }),
);

vi.mock(
  "@/lib/clipstitchr/backend/createSwiprSwipeFromConvexDocument",
  () => ({
    createSwiprSwipeFromConvexDocument:
      mocks.createSwiprSwipeFromConvexDocument,
  }),
);

vi.mock(
  "@/lib/clipstitchr/backend/createVideoClipMetadataFromConvexDocument",
  () => ({
    createVideoClipMetadataFromConvexDocument:
      mocks.createVideoClipMetadataFromConvexDocument,
  }),
);

describe("useDashboardSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useConvexAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    mocks.useQuery.mockReturnValue({
      counts: {
        activeStitches: 0,
        cliprClips: 0,
        demoClips: 2,
        postedStitches: 0,
        stitches: 3,
        swapClips: 1,
        ugcClips: 4,
      },
      recentStitches: [{ id: "stitch_1" }],
      recentSwipeBackgrounds: [{ id: "background_1" }, null],
      recentSwipes: [{ id: "swipe_1" }],
      recentUploads: [{ id: "clip_1" }],
      stitchSourceClips: [{ id: "source_1" }, null],
    });
    mocks.createStitchFromConvexDocument.mockReturnValue({ id: "stitch_1" });
    mocks.createSwiprBackgroundAssetFromConvexDocument.mockReturnValue({
      id: "background_1",
    });
    mocks.createSwiprSwipeFromConvexDocument.mockReturnValue({ id: "swipe_1" });
    mocks.createVideoClipMetadataFromConvexDocument.mockImplementation((clip) => ({
      id: clip.id,
    }));
  });

  it("loads and maps dashboard summary records when authenticated", () => {
    const state = useDashboardSummary();

    expect(state.counts.ugcClips).toBe(4);
    expect(state.recentUploads).toEqual([{ id: "clip_1" }]);
    expect(state.recentStitches).toEqual([{ id: "stitch_1" }]);
    expect(state.recentSwipes).toEqual([{ id: "swipe_1" }]);
    expect(state.recentSwipeBackgrounds).toEqual([{ id: "background_1" }]);
    expect(state.stitchSourceClips).toEqual([{ id: "source_1" }]);
    expect(state.isLoading).toBe(false);
    expect(mocks.useQuery).toHaveBeenCalledWith(api.dashboardSummary.get, {});
  });

  it("skips the summary query while signed out", () => {
    mocks.useConvexAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
    mocks.useQuery.mockReturnValue(undefined);

    const state = useDashboardSummary();

    expect(state.counts.ugcClips).toBe(0);
    expect(state.recentUploads).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(mocks.useQuery).toHaveBeenCalledWith(
      api.dashboardSummary.get,
      "skip",
    );
  });
});
