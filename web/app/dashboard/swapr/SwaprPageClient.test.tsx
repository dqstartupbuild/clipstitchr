import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SwaprPageClient } from "@/app/dashboard/swapr/SwaprPageClient";
import type { Avatar } from "@/lib/clipstitchr/types/Avatar";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

type ChildrenProps = {
  children?: unknown;
};

const mocks = vi.hoisted(() => ({
  clipLibraryState: {
    clips: [] as VideoClipMetadata[],
    error: null as string | null,
    loadClip: vi.fn(),
    refresh: vi.fn(),
    stitches: [] as Record<string, unknown>[],
  },
  photoLibraryState: {
    avatars: [] as Avatar[],
    defaultAvatarId: undefined as string | undefined,
    error: null as string | null,
    photos: [] as PhotoAssetMetadata[],
  },
  swaprGenerationState: {
    error: null as string | null,
    generatedClip: null,
    generate: vi.fn(),
    isGenerating: false,
    progress: 0,
    status: "idle",
  },
  controlsPanelProps: null as Record<string, unknown> | null,
  createStitchExportBlob: vi.fn(),
  createTemporarySwaprReferenceVideoSegments: vi.fn(),
  deleteObjectsFromR2: vi.fn(),
  outputPanelProps: null as Record<string, unknown> | null,
  photoSelectorProps: null as Record<string, unknown> | null,
  sourceClipSelectorProps: null as Record<string, unknown> | null,
  stateSetters: [] as ReturnType<typeof vi.fn>[],
  updateRenderedStitchVideo: vi.fn(),
  uploadBlobsToR2: vi.fn(),
  useEffect: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useEffect: mocks.useEffect,
    useMemo: (factory: () => unknown) => factory(),
    useState: (initialValue: unknown) => {
      const value =
        typeof initialValue === "function"
          ? (initialValue as () => unknown)()
          : initialValue;
      const setter = vi.fn((nextValue: unknown) => {
        if (typeof nextValue === "function") {
          return (nextValue as (currentValue: unknown) => unknown)(value);
        }

        return nextValue;
      });

      mocks.stateSetters.push(setter);

      return [value, setter];
    },
  };
});

vi.mock("convex/react", () => ({
  useMutation: () => mocks.updateRenderedStitchVideo,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    stitches: {
      updateRenderedVideo: "stitches.updateRenderedVideo",
    },
  },
}));

vi.mock("@/app/_components/dashboard/DashboardShell", () => ({
  DashboardShell: ({ children }: ChildrenProps) => children,
}));

vi.mock("@/app/_components/dashboard/DashboardPageHeader", () => ({
  DashboardPageHeader: ({ title }: { title: string }) => `Header:${title}`,
}));

vi.mock("@/app/_components/ui/Panel", () => ({
  Panel: ({ children }: ChildrenProps) => children,
}));

vi.mock("@/app/_components/avatars/AvatarFilterSelect", () => ({
  AvatarFilterSelect: () => "AvatarFilterSelect",
}));

vi.mock("@/app/_components/swapr/SwaprPhotoSelector", () => ({
  SwaprPhotoSelector: (props: Record<string, unknown>) => {
    mocks.photoSelectorProps = props;
    return "SwaprPhotoSelector";
  },
}));

vi.mock("@/app/_components/swapr/SwaprSourceClipSelector", () => ({
  SwaprSourceClipSelector: (props: Record<string, unknown>) => {
    mocks.sourceClipSelectorProps = props;
    return "SwaprSourceClipSelector";
  },
}));

vi.mock("@/app/_components/swapr/SwaprControlsPanel", () => ({
  SwaprControlsPanel: (props: Record<string, unknown>) => {
    mocks.controlsPanelProps = props;
    return "SwaprControlsPanel";
  },
}));

vi.mock("@/app/_components/swapr/SwaprOutputPanel", () => ({
  SwaprOutputPanel: (props: Record<string, unknown>) => {
    mocks.outputPanelProps = props;
    return "SwaprOutputPanel";
  },
}));

vi.mock("@/app/_components/swapr/SwaprEmptyState", () => ({
  SwaprEmptyState: ({ hasPhotos, hasSourceClips }: {
    hasPhotos: boolean;
    hasSourceClips: boolean;
  }) => `SwaprEmptyState:${hasPhotos}:${hasSourceClips}`,
}));

vi.mock("@/lib/clipstitchr/hooks/useClipLibrary", () => ({
  useClipLibrary: () => mocks.clipLibraryState,
}));

vi.mock("@/lib/clipstitchr/hooks/usePhotoLibrary", () => ({
  usePhotoLibrary: () => mocks.photoLibraryState,
}));

vi.mock("@/lib/clipstitchr/hooks/useDashboardProduct", () => ({
  useDashboardProduct: () => ({
    activeProduct: {
      audienceDetails: "Creators",
      createdAt: "2026-01-01T00:00:00.000Z",
      id: "product_1",
      inferredPainPoints: [],
      name: "Launch Kit",
      productDetails: "A launch kit",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    activeProductId: "product_1",
    defaultProductId: "product_1",
    error: null,
    isBackfillingLegacyContent: false,
    isCreating: false,
    isLoading: false,
    isSaving: false,
    products: [],
    requiresProductSetup: false,
    createProduct: vi.fn(),
    setActiveProduct: vi.fn(),
    updateProduct: vi.fn(),
  }),
}));

vi.mock("@/lib/clipstitchr/hooks/useSwaprGeneration", () => ({
  useSwaprGeneration: () => mocks.swaprGenerationState,
}));

vi.mock("@/lib/clipstitchr/client/createStitchExportBlob", () => ({
  createStitchExportBlob: mocks.createStitchExportBlob,
}));

vi.mock(
  "@/lib/clipstitchr/client/createTemporarySwaprReferenceVideoSegments",
  () => ({
    createTemporarySwaprReferenceVideoSegments:
      mocks.createTemporarySwaprReferenceVideoSegments,
  }),
);

vi.mock("@/lib/clipstitchr/client/r2/deleteObjectsFromR2", () => ({
  deleteObjectsFromR2: mocks.deleteObjectsFromR2,
}));

vi.mock("@/lib/clipstitchr/client/r2/uploadBlobsToR2", () => ({
  uploadBlobsToR2: mocks.uploadBlobsToR2,
}));

function createClip(overrides: Partial<VideoClipMetadata> = {}): VideoClipMetadata {
  return {
    aspectRatio: 9 / 16,
    clipType: "ugc",
    createdAt: "2026-01-01T00:00:00.000Z",
    duration: 8,
    hasAudio: true,
    height: 1920,
    id: "clip_1",
    mimeType: "video/mp4",
    name: "UGC clip",
    originalName: "ugc.mp4",
    originalSize: 100,
    size: 100,
    sourceMimeType: "video/mp4",
    updatedAt: "2026-01-01T00:00:00.000Z",
    videoObject: {
      contentType: "video/mp4",
      key: "users/user_1/video-clips/clip_1/video.mp4",
      size: 100,
    },
    width: 1080,
    ...overrides,
  };
}

function createPhoto(): PhotoAssetMetadata {
  return {
    avatarId: "avatar_1",
    createdAt: "2026-01-01T00:00:00.000Z",
    height: 1920,
    id: "photo_1",
    photoObject: {
      contentType: "image/jpeg",
      key: "users/user_1/photos/photo_1.jpg",
      size: 100,
    },
    mimeType: "image/jpeg",
    name: "Avatar photo",
    originalName: "avatar.jpg",
    originalSize: 100,
    size: 100,
    updatedAt: "2026-01-01T00:00:00.000Z",
    width: 1080,
  };
}

function createStitch(overrides: Record<string, unknown> = {}) {
  return {
    createdAt: "2026-01-01T00:00:00.000Z",
    demoClipId: "demo_1",
    duration: 8,
    height: 1920,
    id: "stitch_1",
    mimeType: "video/mp4",
    name: "Rendered Stitch",
    size: 100,
    stitchObject: {
      contentType: "video/mp4",
      key: "users/user_1/stitches/stitch_1/render-on-export",
      size: 100,
    },
    ugcClipId: "clip_1",
    updatedAt: "2026-01-01T00:00:00.000Z",
    videoObject: {
      contentType: "video/mp4",
      key: "users/user_1/stitches/stitch_1/render-on-export",
      size: 100,
    },
    width: 1080,
    ...overrides,
  };
}

describe("SwaprPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.clipLibraryState.clips = [createClip()];
    mocks.clipLibraryState.error = null;
    mocks.clipLibraryState.loadClip.mockResolvedValue({
      ...createClip(),
      blob: new Blob(["clip"], { type: "video/mp4" }),
    });
    mocks.clipLibraryState.refresh.mockResolvedValue(undefined);
    mocks.clipLibraryState.stitches = [];
    mocks.photoLibraryState.error = null;
    mocks.photoLibraryState.avatars = [];
    mocks.photoLibraryState.defaultAvatarId = undefined;
    mocks.photoLibraryState.photos = [createPhoto()];
    mocks.swaprGenerationState.generate.mockResolvedValue(undefined);
    mocks.createTemporarySwaprReferenceVideoSegments.mockResolvedValue([
      {
        duration: 8,
        isTemporary: true,
        videoObject: {
          contentType: "video/mp4",
          key: "temporary/clip.mp4",
          size: 100,
        },
      },
    ]);
    mocks.deleteObjectsFromR2.mockResolvedValue(undefined);
    mocks.createStitchExportBlob.mockResolvedValue(
      new Blob(["stitch"], { type: "video/mp4" }),
    );
    mocks.uploadBlobsToR2.mockResolvedValue([
      {
        contentType: "video/mp4",
        key: "users/user_1/stitches/stitch_1/video.mp4",
        size: 100,
      },
    ]);
    mocks.updateRenderedStitchVideo.mockResolvedValue(undefined);
    mocks.controlsPanelProps = null;
    mocks.outputPanelProps = null;
    mocks.photoSelectorProps = null;
    mocks.sourceClipSelectorProps = null;
    mocks.stateSetters.length = 0;
    mocks.useEffect.mockReset();
  });

  it("renders the Swapr input and output workspace when assets exist", () => {
    const markup = renderToStaticMarkup(<SwaprPageClient />);

    expect(markup).toContain("Header:Create UGC");
    expect(markup).toContain("Choose two inputs");
    expect(markup).toContain("AvatarFilterSelect");
    expect(markup).toContain("SwaprPhotoSelector");
    expect(markup).toContain("SwaprSourceClipSelector");
    expect(markup).toContain("SwaprControlsPanel");
    expect(markup).toContain("SwaprOutputPanel");
  });

  it("renders the empty state and error banner", () => {
    mocks.photoLibraryState.photos = [];
    mocks.clipLibraryState.error = "Clip library unavailable.";

    const markup = renderToStaticMarkup(<SwaprPageClient />);

    expect(markup).toContain("Clip library unavailable.");
    expect(markup).toContain("SwaprEmptyState:false:true");
  });

  it("applies the default avatar photo as the initial Swapr photo selection", () => {
    mocks.photoLibraryState.avatars = [
      {
        cliprVoiceId: "Rachel",
        createdAt: "2026-01-01T00:00:00.000Z",
        id: "avatar_1",
        name: "Avatar",
        updatedAt: "2026-01-01T00:00:00.000Z",
        wardrobeStyle: "any",
      },
    ];
    mocks.photoLibraryState.defaultAvatarId = "avatar_1";

    renderToStaticMarkup(<SwaprPageClient />);

    const photoSelectorProps = mocks.photoSelectorProps as {
      selectedPhotoId: string;
    };

    expect(photoSelectorProps.selectedPhotoId).toBe("photo_1");
  });

  it("exercises Swapr selection and direct-reference generation callbacks", async () => {
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      location: {
        href: "https://clipstitchr.test/dashboard/swapr?photoId=photo_1&clipId=clip_1",
        search: "?photoId=photo_1&clipId=clip_1",
      },
      removeEventListener: vi.fn(),
    });

    renderToStaticMarkup(<SwaprPageClient />);

    const photoSelectorProps = mocks.photoSelectorProps as {
      onSelect: (photo: PhotoAssetMetadata) => void;
    };
    const sourceSelectorProps = mocks.sourceClipSelectorProps as {
      onLoadClip: (id: string) => Promise<unknown>;
      onSelect: (clip: VideoClipMetadata) => void;
    };
    const controlsProps = mocks.controlsPanelProps as {
      onCharacterOrientationChange: (value: "image" | "video") => void;
      onConsentChange: (value: boolean) => void;
      onGenerate: () => void;
      onKeepOriginalSoundChange: (value: boolean) => void;
      onModeChange: (value: "std" | "pro") => void;
      onPromptChange: (value: string) => void;
    };

    photoSelectorProps.onSelect(createPhoto());
    sourceSelectorProps.onSelect(createClip());
    await sourceSelectorProps.onLoadClip("clip_1");
    controlsProps.onPromptChange("Make this natural");
    controlsProps.onModeChange("pro");
    controlsProps.onCharacterOrientationChange("video");
    controlsProps.onKeepOriginalSoundChange(true);
    controlsProps.onConsentChange(true);
    controlsProps.onGenerate();

    for (let index = 0; index < 5; index += 1) {
      await Promise.resolve();
    }
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mocks.swaprGenerationState.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        characterOrientation: "image",
        clip: expect.objectContaining({ id: "clip_1" }),
        photo: expect.objectContaining({ id: "photo_1" }),
        referenceVideoSegments: [
          expect.objectContaining({
            videoObject: expect.objectContaining({
              key: "users/user_1/video-clips/clip_1/video.mp4",
            }),
          }),
        ],
      }),
    );

    vi.unstubAllGlobals();
  });

  it("syncs URL selections in the popstate effect and cleans up", () => {
    let cleanup: (() => void) | undefined;
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();

    mocks.useEffect.mockImplementationOnce((effect: () => void | (() => void)) => {
      cleanup = effect() ?? undefined;
    });
    vi.stubGlobal("window", {
      addEventListener,
      location: {
        href: "https://clipstitchr.test/dashboard/swapr?photoId=photo_1&stitchId=stitch_1",
      },
      removeEventListener,
    });

    renderToStaticMarkup(<SwaprPageClient />);
    cleanup?.();

    expect(addEventListener).toHaveBeenCalledWith(
      "popstate",
      expect.any(Function),
    );
    expect(removeEventListener).toHaveBeenCalledWith(
      "popstate",
      expect.any(Function),
    );

    vi.unstubAllGlobals();
  });

  it("loads stitch sources through render-on-export blobs", async () => {
    mocks.clipLibraryState.stitches = [createStitch()];
    mocks.clipLibraryState.loadClip.mockResolvedValueOnce(null);

    renderToStaticMarkup(<SwaprPageClient />);

    const sourceSelectorProps = mocks.sourceClipSelectorProps as {
      onLoadClip: (id: string) => Promise<unknown>;
    };

    await expect(sourceSelectorProps.onLoadClip("stitch_1")).resolves.toEqual(
      expect.objectContaining({
        blob: expect.any(Blob),
        id: "stitch_1",
      }),
    );
    expect(mocks.createStitchExportBlob).toHaveBeenCalledWith(
      expect.objectContaining({ id: "stitch_1" }),
      expect.objectContaining({
        includePosterMetadata: false,
      }),
    );
  });

  it("updates rendered stitch objects for short render-on-export clips", async () => {
    const clip = createClip({
      duration: 8,
      id: "clip_render",
      videoObject: {
        contentType: "video/mp4",
        key: "users/user_1/stitches/clip_render/render-on-export",
        size: 100,
      },
    });

    mocks.clipLibraryState.clips = [clip];
    mocks.clipLibraryState.loadClip.mockResolvedValueOnce({
      ...clip,
      blob: new Blob(["clip"], { type: "video/mp4" }),
    });
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      location: {
        href: "https://clipstitchr.test/dashboard/swapr?photoId=photo_1&clipId=clip_render",
      },
      removeEventListener: vi.fn(),
    });

    renderToStaticMarkup(<SwaprPageClient />);

    const controlsProps = mocks.controlsPanelProps as {
      onGenerate: () => void;
    };

    controlsProps.onGenerate();

    for (let index = 0; index < 5; index += 1) {
      await Promise.resolve();
    }
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mocks.uploadBlobsToR2).toHaveBeenCalledWith([
      expect.objectContaining({
        kind: "stitch-video",
        recordId: "clip_render",
      }),
    ]);
    expect(mocks.updateRenderedStitchVideo).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "clip_render",
      }),
    );
    expect(mocks.clipLibraryState.refresh).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it("handles missing, oversized, and too-long source clips", async () => {
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      location: {
        href: "https://clipstitchr.test/dashboard/swapr?photoId=photo_1&clipId=clip_1",
      },
      removeEventListener: vi.fn(),
    });

    mocks.clipLibraryState.clips = [
      createClip({
        duration: 91,
      }),
    ];
    renderToStaticMarkup(<SwaprPageClient />);
    (mocks.controlsPanelProps as unknown as { onGenerate: () => void }).onGenerate();

    for (let index = 0; index < 3; index += 1) {
      await Promise.resolve();
    }

    mocks.controlsPanelProps = null;
    mocks.clipLibraryState.clips = [
      createClip({
        duration: 20,
      }),
    ];
    mocks.clipLibraryState.loadClip.mockResolvedValueOnce(null);
    renderToStaticMarkup(<SwaprPageClient />);
    (mocks.controlsPanelProps as unknown as { onGenerate: () => void }).onGenerate();

    for (let index = 0; index < 3; index += 1) {
      await Promise.resolve();
    }

    mocks.controlsPanelProps = null;
    mocks.clipLibraryState.clips = [
      createClip({
        duration: 20,
      }),
    ];
    mocks.clipLibraryState.loadClip.mockResolvedValueOnce({
      ...createClip({
        duration: 20,
      }),
      blob: {
        size: 100_000_001,
        type: "video/mp4",
      },
    });
    renderToStaticMarkup(<SwaprPageClient />);
    (mocks.controlsPanelProps as unknown as { onGenerate: () => void }).onGenerate();

    for (let index = 0; index < 3; index += 1) {
      await Promise.resolve();
    }

    expect(mocks.swaprGenerationState.generate).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it("segments long references and cleans up temporary objects", async () => {
    mocks.clipLibraryState.clips = [
      createClip({
        duration: 20,
      }),
    ];
    mocks.clipLibraryState.loadClip.mockResolvedValueOnce({
      ...createClip({
        duration: 20,
      }),
      blob: new Blob(["clip"], { type: "video/mp4" }),
    });
    mocks.swaprGenerationState.generate.mockRejectedValueOnce(
      new Error("Provider failed"),
    );
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      location: {
        href: "https://clipstitchr.test/dashboard/swapr?photoId=photo_1&clipId=clip_1",
        search: "?photoId=photo_1&clipId=clip_1",
      },
      removeEventListener: vi.fn(),
    });

    renderToStaticMarkup(<SwaprPageClient />);

    const controlsProps = mocks.controlsPanelProps as {
      onGenerate: () => void;
    };

    controlsProps.onGenerate();

    for (let index = 0; index < 5; index += 1) {
      await Promise.resolve();
    }
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mocks.createTemporarySwaprReferenceVideoSegments).toHaveBeenCalled();
    expect(mocks.deleteObjectsFromR2).toHaveBeenCalledWith([
      expect.objectContaining({
        key: "temporary/clip.mp4",
      }),
    ]);

    vi.unstubAllGlobals();
  });
});
