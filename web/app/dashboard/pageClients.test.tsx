import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CliprPageClient } from "@/app/dashboard/clipr/CliprPageClient";
import { LibraryPageClient } from "@/app/dashboard/library/LibraryPageClient";
import { StitchrPageClient } from "@/app/dashboard/stitchr/StitchrPageClient";
import { SwaprPageClient } from "@/app/dashboard/swapr/SwaprPageClient";
import { SwiprPageClient } from "@/app/dashboard/swipr/SwiprPageClient";

const mocks = vi.hoisted(() => ({
  exportCarousel: vi.fn(),
  loadBackgroundAsset: vi.fn(),
  loadBackgroundBlob: vi.fn(),
  loadClip: vi.fn(),
  loadPhoto: vi.fn(),
  createProduct: vi.fn(),
  refresh: vi.fn(),
  remove: vi.fn(),
  saveBackground: vi.fn(),
  saveFiles: vi.fn(),
  saveGeneratedPhotos: vi.fn(),
  saveSwipe: vi.fn(),
  setActiveProduct: vi.fn(),
  stitchLongrSequence: vi.fn(),
  stitchVideos: vi.fn(),
  updateProduct: vi.fn(),
  useMutation: vi.fn(() => vi.fn()),
}));

vi.mock("convex/react", () => ({
  useConvexAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
  }),
  useMutation: mocks.useMutation,
  useQuery: () => [],
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    mediaJobs: {
      listActive: "mediaJobs.listActive",
    },
    notifications: {
      clearAll: "notifications.clearAll",
      listRecent: "notifications.listRecent",
      markAllRead: "notifications.markAllRead",
      markRead: "notifications.markRead",
      remove: "notifications.remove",
    },
    providerJobs: {
      listActive: "providerJobs.listActive",
    },
    sharedMusicTracks: {
      list: "sharedMusicTracks.list",
    },
    stitches: {
      updateRenderedVideo: "stitches.updateRenderedVideo",
    },
    videoClips: {
      save: "videoClips.save",
    },
  },
}));

vi.mock("@clerk/nextjs", () => ({
  UserButton: () => <div data-testid="user-button" />,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/stitchr",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/lib/clipstitchr/hooks/useProducts", () => ({
  useProducts: () => ({
    error: null,
    isLoading: false,
    products: [
      {
        id: "product_1",
        inferredPainPoints: ["slow launch"],
        inferredProblem: "campaigns take too long",
        name: "Launch Kit",
        productDetails: "AI launch planner",
        audienceDetails: "Founders",
      },
    ],
  }),
}));

vi.mock("@/lib/clipstitchr/hooks/useDashboardProduct", () => ({
  useDashboardProduct: () => ({
    activeProduct: {
      id: "product_1",
      inferredPainPoints: ["slow launch"],
      inferredProblem: "campaigns take too long",
      name: "Launch Kit",
      productDetails: "AI launch planner",
      audienceDetails: "Founders",
    },
    activeProductId: "product_1",
    defaultProductId: "product_1",
    error: null,
    isBackfillingLegacyContent: false,
    isCreating: false,
    isLoading: false,
    isSaving: false,
    products: [
      {
        id: "product_1",
        inferredPainPoints: ["slow launch"],
        inferredProblem: "campaigns take too long",
        name: "Launch Kit",
        productDetails: "AI launch planner",
        audienceDetails: "Founders",
      },
    ],
    requiresProductSetup: false,
    createProduct: mocks.createProduct,
    setActiveProduct: mocks.setActiveProduct,
    updateProduct: mocks.updateProduct,
  }),
}));

vi.mock("@/lib/clipstitchr/hooks/useStitchTemplates", () => ({
  useStitchTemplates: () => ({
    createTemplateFromStitch: vi.fn(),
    deleteTemplate: vi.fn(),
    deletingTemplateId: null,
    error: null,
    isLoading: false,
    renameTemplate: vi.fn(),
    savingStitchId: null,
    savingTemplateId: null,
    templates: [],
  }),
}));

vi.mock("@/lib/clipstitchr/hooks/useSwiprExport", () => ({
  useSwiprExport: () => ({
    error: null,
    exportCarousel: mocks.exportCarousel,
    progress: 0,
    status: "idle",
  }),
}));

vi.mock("@/lib/clipstitchr/hooks/useSwiprLibrary", () => ({
  useSwiprLibrary: () => ({
    backgrounds: [
      {
        blob: new Blob(["background"], { type: "image/jpeg" }),
        category: "studio",
        id: "background_1",
        name: "Studio",
        source: "upload",
        tags: ["studio"],
        thumbnailBlob: new Blob(["thumb"], { type: "image/jpeg" }),
      },
    ],
    error: null,
    isSavingBackground: false,
    isSavingSwipe: false,
    loadBackgroundAsset: mocks.loadBackgroundAsset,
    loadBackgroundBlob: mocks.loadBackgroundBlob,
    loadSwipePoster: vi.fn(),
    removeSwipe: mocks.remove,
    refresh: mocks.refresh,
    saveBackground: mocks.saveBackground,
    saveSwipe: mocks.saveSwipe,
    postedSwipes: [],
    swipes: [],
    updateSwipePostedStatus: vi.fn(),
  }),
}));

vi.mock("@/lib/clipstitchr/hooks/useClipLibrary", () => ({
  useClipLibrary: () => {
    const ugcClip = createClip({
      clipType: "ugc",
      id: "ugc_1",
      name: "UGC clip",
    });
    const demoClip = createClip({
      clipType: "demo",
      id: "demo_1",
      name: "Demo clip",
      productId: "product_1",
    });
    const clips = [ugcClip, demoClip];

    return {
      clips,
      counts: {
        activeStitches: 1,
        cliprClips: 0,
        demoClips: 1,
        postedStitches: 0,
        stitches: 1,
        swapClips: 0,
        ugcClips: 1,
      },
      error: null,
      hasMorePostedStitches: false,
      hasMoreStitches: false,
      isLoading: false,
      isLoadingMorePostedStitches: false,
      isLoadingMoreStitches: false,
      isSaving: false,
      loadClip: mocks.loadClip,
      loadClipPoster: vi.fn(),
      loadStitch: vi.fn(),
      loadMorePostedStitches: vi.fn(),
      loadMoreStitches: vi.fn(),
      postedStitches: [],
      removeClip: mocks.remove,
      removeStitch: mocks.remove,
      refresh: mocks.refresh,
      setSortOrder: vi.fn(),
      sortOrder: "newest",
      updateClipMetadata: vi.fn(),
      updateCliprMusic: vi.fn(),
      updateClipTrimRange: vi.fn(),
      updateStitchMusic: vi.fn(),
      updateStitchPostedStatus: vi.fn(),
      updateStitchSocialCaption: vi.fn(),
      updateStitchSourceSettings: vi.fn(),
      updateStitchTextOverlay: vi.fn(),
      stitches: [
        {
          createdAt: "2026-05-20T00:00:00.000Z",
          demoClipId: "demo_1",
          demoClipName: "Demo clip",
          duration: 18,
          height: 1920,
          id: "stitch_1",
          mimeType: "video/mp4",
          name: "Saved stitch",
          size: 100,
          stitchObject: { key: "users/user_123/stitches/stitch_1.mp4" },
          ugcClipId: "ugc_1",
          ugcClipName: "UGC clip",
          updatedAt: "2026-05-20T00:00:00.000Z",
          width: 1080,
        },
      ],
      videoGroups: {
        clipr: {
          clips: [],
          postedClips: [],
          hasMoreItems: false,
          hasMorePostedItems: false,
          isLoadingMoreItems: false,
          isLoadingMorePostedItems: false,
          loadMoreItems: vi.fn(),
          loadMorePostedItems: vi.fn(),
        },
        demo: {
          clips: [demoClip],
          postedClips: [],
          hasMoreItems: false,
          hasMorePostedItems: false,
          isLoadingMoreItems: false,
          isLoadingMorePostedItems: false,
          loadMoreItems: vi.fn(),
          loadMorePostedItems: vi.fn(),
        },
        swapr: {
          clips: [],
          postedClips: [],
          hasMoreItems: false,
          hasMorePostedItems: false,
          isLoadingMoreItems: false,
          isLoadingMorePostedItems: false,
          loadMoreItems: vi.fn(),
          loadMorePostedItems: vi.fn(),
        },
        ugc: {
          clips: [ugcClip],
          postedClips: [],
          hasMoreItems: false,
          hasMorePostedItems: false,
          isLoadingMoreItems: false,
          isLoadingMorePostedItems: false,
          loadMoreItems: vi.fn(),
          loadMorePostedItems: vi.fn(),
        },
      },
    };
  },
}));

vi.mock("@/lib/clipstitchr/hooks/useLoadedVideoClip", () => ({
  useLoadedVideoClip: ({ clipId }: { clipId: string | null }) => ({
    clip: clipId ? createClip({ id: clipId, name: `Loaded ${clipId}` }) : null,
    error: null,
    isLoading: false,
  }),
}));

vi.mock("@/lib/clipstitchr/hooks/useStitchr", () => ({
  useStitchr: () => ({
    completedCount: 0,
    error: null,
    progress: 0,
    status: "idle",
    stitchLongrSequence: mocks.stitchLongrSequence,
    stitchVideos: mocks.stitchVideos,
    stitches: [],
    totalCount: 0,
  }),
}));

vi.mock("@/lib/clipstitchr/hooks/useShowUploadControls", () => ({
  useShowUploadControls: () => true,
}));

vi.mock("@/lib/clipstitchr/hooks/useCreateAvatarFromUgcClip", () => ({
  useCreateAvatarFromUgcClip: () => ({
    createdAvatar: null,
    error: null,
    generate: vi.fn(async () => null),
    generatedCount: 0,
    isGenerating: false,
  }),
}));

vi.mock("@/lib/clipstitchr/hooks/usePhotoLibrary", () => ({
  usePhotoLibrary: () => ({
    avatars: [
      {
        cliprVoiceId: "Rachel",
        id: "avatar_1",
        name: "Avatar",
        wardrobeStyle: "any",
      },
    ],
    defaultAvatarId: "avatar_1",
    defaultCliprVoiceId: "Rachel",
    error: null,
    isLoading: false,
    isSaving: false,
    createAvatar: vi.fn(),
    loadPhoto: mocks.loadPhoto,
    photos: [
      {
        avatarId: "avatar_1",
        height: 1920,
        id: "photo_1",
        name: "Avatar photo",
        photoObject: { key: "users/user_123/photos/photo_1.jpg" },
        thumbnailBlob: new Blob(["thumb"], { type: "image/jpeg" }),
        tags: ["photo"],
        width: 1080,
      },
    ],
    refresh: mocks.refresh,
    removeAvatar: mocks.remove,
    removePhoto: mocks.remove,
    renameAvatar: vi.fn(),
    saveFiles: mocks.saveFiles,
    saveGeneratedPhotos: mocks.saveGeneratedPhotos,
    setDefaultAvatar: vi.fn(),
    setDefaultCliprVoice: vi.fn(),
    updateAvatarCliprVoice: vi.fn(),
    updateAvatarWardrobeStyle: vi.fn(),
    updatePhotoMetadata: vi.fn(),
  }),
}));

vi.mock("@/lib/clipstitchr/hooks/useAvatarPhotoGeneration", () => ({
  useAvatarPhotoGeneration: () => ({
    error: null,
    generate: vi.fn(),
    generatedCount: 0,
    isGenerating: false,
  }),
}));

vi.mock("@/lib/clipstitchr/hooks/useSwaprGeneration", () => ({
  useSwaprGeneration: () => ({
    error: null,
    generate: vi.fn(),
    generatedClip: null,
    isGenerating: false,
    progress: 0,
    status: "idle",
  }),
}));

vi.mock("@/lib/clipstitchr/hooks/useCliprGeneration", () => ({
  useCliprGeneration: () => ({
    error: null,
    finalClipId: null,
    generate: vi.fn(),
    isGenerating: false,
    job: null,
    message: null,
    progress: 0,
    status: "idle",
  }),
}));

function createClip(overrides: Record<string, unknown> = {}) {
  return {
    aspectRatio: 9 / 16,
    blob: new Blob(["video"], { type: "video/mp4" }),
    clipType: "ugc",
    defaultTrimRange: { end: 12, start: 0 },
    duration: 12,
    hasAudio: true,
    height: 1920,
    id: "clip_1",
    mimeType: "video/mp4",
    name: "Clip",
    originalName: "clip.mp4",
    originalSize: 100,
    posterObject: { key: "users/user_123/poster.jpg" },
    size: 100,
    sourceMimeType: "video/mp4",
    tags: ["ugc"],
    videoObject: { key: "users/user_123/video.mp4" },
    width: 1080,
    ...overrides,
  };
}

describe("dashboard page clients", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.loadBackgroundBlob.mockResolvedValue(
      new Blob(["background"], { type: "image/jpeg" }),
    );
    mocks.loadClip.mockResolvedValue(createClip());
  });

  it("renders the Stitchr workflow with batch controls", () => {
    const markup = renderToStaticMarkup(<StitchrPageClient />);

    expect(markup).toContain("Stitchr");
    expect(markup).toContain("Generate today&#x27;s stitch batch");
    expect(markup).toContain("Generate 10 Stitches");
  });

  it("renders the Swapr workflow with photo and source clip inputs", () => {
    const markup = renderToStaticMarkup(<SwaprPageClient />);

    expect(markup).toContain("Create UGC");
    expect(markup).toContain("Avatar photo");
    expect(markup).toContain("UGC clip");
  });

  it("renders the Swipr carousel workflow with saved product and background data", () => {
    const markup = renderToStaticMarkup(<SwiprPageClient />);

    expect(markup).toContain("Create TikTok carousels");
    expect(markup).toContain("Launch Kit");
    expect(markup).toContain("Batch");
    expect(markup).toContain("Generate Swipes");
    expect(markup).toContain("Choose packs");
  });

  it("renders the Library with UGC as the default tab", () => {
    const markup = renderToStaticMarkup(<LibraryPageClient />);

    expect(markup).toContain("Library");
    expect(markup).toContain("UGC clip");
  });

  it("renders the Clipr generator with product and avatar selectors", () => {
    const markup = renderToStaticMarkup(<CliprPageClient />);

    expect(markup).toContain("Create more UGC");
    expect(markup).toContain("Launch Kit");
    expect(markup).toContain("Avatar");
  });
});
