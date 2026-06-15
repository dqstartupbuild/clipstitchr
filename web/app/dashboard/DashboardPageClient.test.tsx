import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardPageClient } from "@/app/dashboard/DashboardPageClient";

type ChildrenProps = {
  children?: React.ReactNode;
};

const mocks = vi.hoisted(() => ({
  clipLibraryState: {
    clips: [],
    counts: {
      activeStitches: 0,
      cliprClips: 0,
      demoClips: 0,
      postedStitches: 0,
      stitches: 0,
      swapClips: 0,
      ugcClips: 0,
    },
    error: null as string | null,
    generateStitchMusic: vi.fn(),
    loadClip: vi.fn(),
    loadStitch: vi.fn(),
    loadStitchPoster: vi.fn(),
    postedStitches: [],
    removeClip: vi.fn(),
    removeStitch: vi.fn(),
    stitches: [],
    updateClipMetadata: vi.fn(),
    updateClipTrimRange: vi.fn(),
    updateStitchMusic: vi.fn(),
    updateStitchPostedStatus: vi.fn(),
    updateStitchSocialCaption: vi.fn(),
    updateStitchSourceSettings: vi.fn(),
    updateStitchTextOverlay: vi.fn(),
    videoGroups: {
      clipr: {
        clips: [],
        postedClips: [],
      },
      demo: {
        clips: [],
        postedClips: [],
      },
      swapr: {
        clips: [],
        postedClips: [],
      },
      ugc: {
        clips: [],
        postedClips: [],
      },
    },
  },
  dashboardSummary: {
    counts: {
      activeStitches: 0,
      cliprClips: 0,
      demoClips: 0,
      postedStitches: 0,
      stitches: 0,
      swapClips: 0,
      ugcClips: 0,
    },
    isLoading: false,
    recentStitches: [],
    recentSwipeBackgrounds: [],
    recentSwipes: [],
    recentUploads: [],
    stitchSourceClips: [],
  },
  productState: {
    error: null as string | null,
    products: [],
  },
  stitchTemplateState: {
    createTemplateFromStitch: vi.fn(),
    deleteTemplate: vi.fn(),
    deletingTemplateId: null as string | null,
    error: null as string | null,
    isLoading: false,
    renameTemplate: vi.fn(),
    savingStitchId: null as string | null,
    savingTemplateId: null as string | null,
    templates: [],
  },
  swiprLibraryState: {
    backgrounds: [],
    error: null as string | null,
    loadBackgroundBlob: vi.fn(),
    loadSwipePoster: vi.fn(),
    postedSwipes: [],
    removeSwipe: vi.fn(),
    swipes: [],
    updateSwipePostedStatus: vi.fn(),
  },
}));

vi.mock("@/app/_components/dashboard/DashboardShell", () => ({
  DashboardShell: ({ children }: ChildrenProps) => children,
}));

vi.mock("@/app/_components/dashboard/DashboardHeader", () => ({
  DashboardHeader: () => "DashboardHeader",
}));

vi.mock("@/app/_components/dashboard/DashboardStats", () => ({
  DashboardStats: ({
    demoCount,
    stitchesCount,
    ugcCount,
  }: {
    demoCount: number;
    stitchesCount: number;
    ugcCount: number;
  }) => `DashboardStats:${ugcCount}:${demoCount}:${stitchesCount}`,
}));

vi.mock("@/app/_components/dashboard/RecentStitchesSection", () => ({
  RecentStitchesSection: () => "RecentStitchesSection",
}));

vi.mock("@/app/_components/dashboard/RecentSwipesSection", () => ({
  RecentSwipesSection: () => "RecentSwipesSection",
}));

vi.mock("@/app/_components/dashboard/RecentUploadsSection", () => ({
  RecentUploadsSection: () => "RecentUploadsSection",
}));

vi.mock("@/app/_components/dashboard/StitchrCallout", () => ({
  StitchrCallout: () => "StitchrCallout",
}));

vi.mock("@/lib/clipstitchr/hooks/useClipLibrary", () => ({
  useClipLibrary: () => mocks.clipLibraryState,
}));

vi.mock("@/lib/clipstitchr/hooks/useDashboardSummary", () => ({
  useDashboardSummary: () => mocks.dashboardSummary,
}));

vi.mock("@/lib/clipstitchr/hooks/useProducts", () => ({
  useProducts: () => mocks.productState,
}));

vi.mock("@/lib/clipstitchr/hooks/useStitchTemplateActions", () => ({
  useStitchTemplateActions: () => mocks.stitchTemplateState,
}));

vi.mock("@/lib/clipstitchr/hooks/useSwiprLibrary", () => ({
  useSwiprLibrary: () => mocks.swiprLibraryState,
}));

function createClip(id: string, clipType: "ugc" | "demo") {
  return {
    clipType,
    createdAt: `2026-05-20T00:00:0${id.at(-1) ?? "0"}.000Z`,
    duration: 8,
    id,
    name: id,
    updatedAt: "2026-05-20T00:00:00.000Z",
  };
}

describe("DashboardPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.dashboardSummary.counts = {
      activeStitches: 40,
      cliprClips: 0,
      demoClips: 20,
      postedStitches: 0,
      stitches: 40,
      swapClips: 0,
      ugcClips: 40,
    };
    mocks.dashboardSummary.recentUploads = [
      createClip("ugc_1", "ugc"),
      createClip("demo_1", "demo"),
      {
        ...createClip("clipr_1", "ugc"),
        cliprMetadata: {},
      },
    ] as never;
    mocks.dashboardSummary.stitchSourceClips = [
      mocks.dashboardSummary.recentUploads[0],
      mocks.dashboardSummary.recentUploads[1],
      mocks.dashboardSummary.recentUploads[2],
    ] as never;
    mocks.clipLibraryState.error = null;
    mocks.dashboardSummary.recentStitches = [
      {
        backgroundId: "background_1",
        createdAt: "2026-05-20T00:00:00.000Z",
        id: "stitch_1",
        updatedAt: "2026-05-20T00:00:00.000Z",
      },
    ] as never;
    mocks.productState.error = null;
    mocks.productState.products = [];
    mocks.swiprLibraryState.error = null;
    mocks.dashboardSummary.recentSwipeBackgrounds = [
      {
        id: "background_1",
      },
    ] as never;
    mocks.dashboardSummary.recentSwipes = [
      {
        backgroundId: "background_1",
        createdAt: "2026-05-20T00:00:00.000Z",
        id: "swipe_1",
      },
      {
        backgroundId: "missing_background",
        createdAt: "2026-05-20T00:00:01.000Z",
        id: "swipe_2",
      },
    ] as never;
  });

  it("renders dashboard sections and derived stats", () => {
    const markup = renderToStaticMarkup(<DashboardPageClient />);

    expect(markup).toContain("DashboardHeader");
    expect(markup).toContain("DashboardStats:40:20:40");
    expect(markup).toContain("RecentUploadsSection");
    expect(markup).toContain("RecentStitchesSection");
    expect(markup).toContain("RecentSwipesSection");
    expect(markup).toContain("StitchrCallout");
  });

  it("surfaces the first available library error", () => {
    mocks.clipLibraryState.error = "Library unavailable.";

    expect(renderToStaticMarkup(<DashboardPageClient />)).toContain(
      "Library unavailable.",
    );

    mocks.clipLibraryState.error = null;
    mocks.productState.error = "Products unavailable.";

    expect(renderToStaticMarkup(<DashboardPageClient />)).toContain(
      "Products unavailable.",
    );
  });
});
