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
    error: null as string | null,
    generateStitchMusic: vi.fn(),
    loadClip: vi.fn(),
    longrVideos: [],
    removeClip: vi.fn(),
    removeLongrVideo: vi.fn(),
    removeStitch: vi.fn(),
    stitches: [],
    updateClipMetadata: vi.fn(),
    updateClipTrimRange: vi.fn(),
    updateStitchMusic: vi.fn(),
    updateStitchTextOverlay: vi.fn(),
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
  swiprLibraryState: {
    backgrounds: [],
    error: null as string | null,
    loadBackgroundBlob: vi.fn(),
    removeSwipe: vi.fn(),
    swipes: [],
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
    clipsCount,
    demoCount,
    stitchesCount,
    ugcCount,
  }: {
    clipsCount: number;
    demoCount: number;
    stitchesCount: number;
    ugcCount: number;
  }) => `DashboardStats:${ugcCount}:${demoCount}:${clipsCount}:${stitchesCount}`,
}));

vi.mock("@/app/_components/dashboard/RecentStitchesSection", () => ({
  RecentStitchesSection: () => "RecentStitchesSection",
}));

vi.mock("@/app/_components/dashboard/RecentLongsSection", () => ({
  RecentLongsSection: () => "RecentLongsSection",
}));

vi.mock("@/app/_components/dashboard/RecentSwipesSection", () => ({
  RecentSwipesSection: () => "RecentSwipesSection",
}));

vi.mock("@/app/_components/dashboard/RecentUploadsSection", () => ({
  RecentUploadsSection: () => "RecentUploadsSection",
}));

vi.mock("@/app/_components/dashboard/RecentAvatarsSection", () => ({
  RecentAvatarsSection: () => "RecentAvatarsSection",
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
    mocks.clipLibraryState.clips = [
      createClip("ugc_1", "ugc"),
      createClip("demo_1", "demo"),
      {
        ...createClip("clipr_1", "ugc"),
        cliprMetadata: {},
      },
    ] as never;
    mocks.clipLibraryState.error = null;
    mocks.clipLibraryState.stitches = [
      {
        backgroundId: "background_1",
        createdAt: "2026-05-20T00:00:00.000Z",
        id: "stitch_1",
        updatedAt: "2026-05-20T00:00:00.000Z",
      },
    ] as never;
    mocks.clipLibraryState.longrVideos = [
      {
        createdAt: "2026-05-20T00:00:00.000Z",
        id: "longr_1",
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
    expect(markup).toContain("DashboardStats:1:1:1:1");
    expect(markup).toContain("RecentStitchesSection");
    expect(markup).toContain("RecentLongsSection");
    expect(markup).toContain("RecentSwipesSection");
    expect(markup).toContain("RecentUploadsSection");
    expect(markup).toContain("RecentAvatarsSection");
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
