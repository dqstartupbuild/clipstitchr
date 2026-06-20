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
  photoLibraryState: {
    avatars: [],
    error: null as string | null,
    loadPhoto: vi.fn(),
    photos: [],
    removePhoto: vi.fn(),
    updatePhotoMetadata: vi.fn(),
  },
  productState: {
    error: null as string | null,
    products: [],
  },
  dashboardSummary: {
    demoClips: [],
    recentStitches: [],
    recentSwipes: [],
    recentUploads: [],
    stitchrUgcSourceClips: [],
    swipeBackgrounds: [],
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
    loadBackgroundAsset: vi.fn(),
    loadBackgroundBlob: vi.fn(),
    loadSwipePoster: vi.fn(),
    postedSwipes: [],
    removeSwipe: vi.fn(),
    swipes: [],
    updateSwipePostedStatus: vi.fn(),
  },
}));

vi.mock("convex/react", () => ({
  useConvexAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
  }),
  useQuery: () => mocks.dashboardSummary,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    dashboardSummary: {
      get: "dashboardSummary.get",
    },
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

vi.mock("@/lib/clipstitchr/hooks/usePhotoLibrary", () => ({
  usePhotoLibrary: () => mocks.photoLibraryState,
}));

vi.mock("@/lib/clipstitchr/hooks/useProducts", () => ({
  useProducts: () => mocks.productState,
}));

vi.mock("@/lib/clipstitchr/hooks/useDashboardProduct", () => ({
  useDashboardProduct: () => {
    const products = mocks.productState.products as Array<{ id: string }>;
    const activeProduct = products[0];

    return {
      activeProduct,
      activeProductId: activeProduct?.id,
      defaultProductId: activeProduct?.id,
      defaultingProductId: null,
      deletingProductId: null,
      error: mocks.productState.error,
      isBackfillingLegacyContent: false,
      isCreating: false,
      isLoading: false,
      isSaving: false,
      products,
      requiresProductSetup: false,
      savingProductId: null,
      createProduct: vi.fn(),
      deleteProduct: vi.fn(),
      setActiveProduct: vi.fn(),
      updateProduct: vi.fn(),
    };
  },
}));

vi.mock("@/lib/clipstitchr/hooks/useStitchTemplates", () => ({
  useStitchTemplates: () => mocks.stitchTemplateState,
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
    mocks.clipLibraryState.counts = {
      activeStitches: 40,
      cliprClips: 0,
      demoClips: 20,
      postedStitches: 0,
      stitches: 40,
      swapClips: 0,
      ugcClips: 40,
    };
    mocks.clipLibraryState.clips = [
      createClip("ugc_1", "ugc"),
      createClip("demo_1", "demo"),
      {
        ...createClip("clipr_1", "ugc"),
        cliprMetadata: {},
      },
    ] as never;
    mocks.clipLibraryState.videoGroups = {
      clipr: {
        clips: [mocks.clipLibraryState.clips[2]],
        postedClips: [],
      },
      demo: {
        clips: [mocks.clipLibraryState.clips[1]],
        postedClips: [],
      },
      swapr: {
        clips: [],
        postedClips: [],
      },
      ugc: {
        clips: [mocks.clipLibraryState.clips[0]],
        postedClips: [],
      },
    } as never;
    mocks.clipLibraryState.error = null;
    mocks.clipLibraryState.stitches = [
      {
        backgroundId: "background_1",
        createdAt: "2026-05-20T00:00:00.000Z",
        id: "stitch_1",
        updatedAt: "2026-05-20T00:00:00.000Z",
      },
    ] as never;
    mocks.photoLibraryState.error = null;
    mocks.photoLibraryState.photos = [
      {
        avatarId: "avatar_1",
        createdAt: "2026-05-20T00:00:00.000Z",
        id: "photo_1",
      },
    ] as never;
    mocks.productState.error = null;
    mocks.productState.products = [];
    mocks.swiprLibraryState.error = null;
    mocks.swiprLibraryState.backgrounds = [
      {
        id: "background_1",
      },
    ] as never;
    mocks.swiprLibraryState.swipes = [
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
    mocks.photoLibraryState.error = "Photos unavailable.";

    expect(renderToStaticMarkup(<DashboardPageClient />)).toContain(
      "Photos unavailable.",
    );

    mocks.photoLibraryState.error = null;
    mocks.productState.error = "Products unavailable.";

    expect(renderToStaticMarkup(<DashboardPageClient />)).toContain(
      "Products unavailable.",
    );
  });
});
