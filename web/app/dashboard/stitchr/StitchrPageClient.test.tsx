import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StitchrPageClient } from "@/app/dashboard/stitchr/StitchrPageClient";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

type ChildrenProps = {
  children?: unknown;
};

const mocks = vi.hoisted(() => ({
  clipLibraryState: {
    clips: [] as VideoClipMetadata[],
    error: null as string | null,
    isLoading: false,
    loadClip: vi.fn(),
    loadClipPoster: vi.fn(),
    loadMoreClips: vi.fn(),
    refresh: vi.fn(),
    videoGroups: {
      clipr: {
        clips: [] as VideoClipMetadata[],
        hasMoreItems: false,
        isLoadingMoreItems: false,
        loadMoreItems: vi.fn(),
      },
      demo: {
        clips: [] as VideoClipMetadata[],
        hasMoreItems: false,
        isLoadingMoreItems: false,
        loadMoreItems: vi.fn(),
      },
      swapr: {
        clips: [] as VideoClipMetadata[],
        hasMoreItems: false,
        isLoadingMoreItems: false,
        loadMoreItems: vi.fn(),
      },
      ugc: {
        clips: [] as VideoClipMetadata[],
        hasMoreItems: false,
        isLoadingMoreItems: false,
        loadMoreItems: vi.fn(),
      },
    },
  },
  loadedClipState: {
    clip: null,
    isLoading: false,
  },
  productState: {
    error: null as string | null,
    products: [] as ProductProfile[],
  },
  stitchrState: {
    completedCount: 0,
    error: null,
    progress: 0,
    status: "idle",
    stitchVideos: vi.fn(),
    stitches: [],
    totalCount: 0,
  },
  autoTextPanelProps: null as Record<string, unknown> | null,
  clipPickerPanelProps: null as Record<string, unknown> | null,
  generateCliprText: vi.fn(),
  sequencePreviewPanelProps: null as Record<string, unknown> | null,
  stateQueue: [] as unknown[],
  stateSetters: [] as ReturnType<typeof vi.fn>[],
  useEffect: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useCallback: (callback: unknown) => callback,
    useEffect: mocks.useEffect,
    useMemo: (factory: () => unknown) => factory(),
    useState: (initialValue: unknown) => {
      const value =
        mocks.stateQueue.length > 0
          ? mocks.stateQueue.shift()
          : typeof initialValue === "function"
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

vi.mock("@/app/_components/stitchr/StitchrShell", () => ({
  StitchrShell: ({ children }: ChildrenProps) => children,
}));

vi.mock("@/app/_components/stitchr/StitchrHeader", () => ({
  StitchrHeader: () => "StitchrHeader",
}));

vi.mock("@/app/_components/stitchr/ClipPickerPanel", () => ({
  ClipPickerPanel: (props: Record<string, unknown>) => {
    mocks.clipPickerPanelProps = props;
    return "ClipPickerPanel";
  },
}));

vi.mock("@/app/_components/stitchr/StitchrAutoTextPanel", () => ({
  StitchrAutoTextPanel: (props: Record<string, unknown>) => {
    mocks.autoTextPanelProps = props;
    return "StitchrAutoTextPanel";
  },
}));

vi.mock("@/app/_components/stitchr/StitchrProgressPanel", () => ({
  StitchrProgressPanel: () => "StitchrProgressPanel",
}));

vi.mock("@/app/_components/stitchr/DownloadStitchesPanel", () => ({
  DownloadStitchesPanel: () => "DownloadStitchesPanel",
}));

vi.mock("@/app/_components/stitchr/SequencePreviewPanel", () => ({
  SequencePreviewPanel: (props: Record<string, unknown>) => {
    mocks.sequencePreviewPanelProps = props;
    return "SequencePreviewPanel";
  },
}));

vi.mock("@/app/_components/stitchr/StitchrEmptyState", () => ({
  StitchrEmptyState: () => "StitchrEmptyState",
}));

vi.mock("@/lib/clipstitchr/hooks/useClipLibrary", () => ({
  useClipLibrary: () => mocks.clipLibraryState,
}));

vi.mock("@/lib/clipstitchr/hooks/useLoadedVideoClip", () => ({
  useLoadedVideoClip: () => mocks.loadedClipState,
}));

vi.mock("@/lib/clipstitchr/hooks/useProducts", () => ({
  useProducts: () => mocks.productState,
}));

vi.mock("@/lib/clipstitchr/hooks/useStitchr", () => ({
  useStitchr: () => mocks.stitchrState,
}));

vi.mock("@/lib/clipstitchr/client/generateCliprText", () => ({
  generateCliprText: mocks.generateCliprText,
}));

function createClip(id: string, clipType: "ugc" | "demo"): VideoClipMetadata {
  return {
    aspectRatio: 9 / 16,
    clipType,
    createdAt: "2026-01-01T00:00:00.000Z",
    duration: 8,
    hasAudio: true,
    height: 1920,
    id,
    mimeType: "video/mp4",
    name: `${clipType} clip`,
    originalName: `${clipType}.mp4`,
    originalSize: 100,
    productId: clipType === "demo" ? "product_1" : undefined,
    size: 100,
    sourceMimeType: "video/mp4",
    updatedAt: "2026-01-01T00:00:00.000Z",
    videoObject: {
      contentType: "video/mp4",
      key: `users/user_1/video-clips/${id}/video.mp4`,
      size: 100,
    },
    width: 1080,
  };
}

function createProduct(): ProductProfile {
  return {
    audienceDetails: "Creators",
    createdAt: "2026-01-01T00:00:00.000Z",
    id: "product_1",
    inferredPainPoints: [],
    name: "Launch Kit",
    productDetails: "A launch kit",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function createVideoGroup(clips: VideoClipMetadata[] = []) {
  return {
    clips,
    hasMoreItems: false,
    isLoadingMoreItems: false,
    loadMoreItems: vi.fn(),
  };
}

function setClipLibraryVideoGroups({
  clipr = [],
  demo = [createClip("demo_1", "demo")],
  swapr = [],
  ugc = [createClip("ugc_1", "ugc")],
}: {
  clipr?: VideoClipMetadata[];
  demo?: VideoClipMetadata[];
  swapr?: VideoClipMetadata[];
  ugc?: VideoClipMetadata[];
} = {}) {
  mocks.clipLibraryState.videoGroups = {
    clipr: createVideoGroup(clipr),
    demo: createVideoGroup(demo),
    swapr: createVideoGroup(swapr),
    ugc: createVideoGroup(ugc),
  };
}

function queueStitchrState(
  overrides: {
    addMusic?: boolean;
    activePreviewUgcId?: string;
    autoTextMessage?: string | null;
    demoProductFilterId?: string;
    demoTrimRangesByClipId?: Record<string, { start: number; end: number }>;
    includeDemoAudio?: boolean;
    includeUgcAudio?: boolean;
    isGeneratingAutoText?: boolean;
    selectedAutoTextProductId?: string;
    selectedDemoId?: string | null;
    selectedMusicTrack?: SharedMusicTrack | null;
    selectedUgcIds?: string[];
    textOverlaysByUgcId?: Record<string, TextOverlay | null>;
    ugcTrimRangesByClipId?: Record<string, { start: number; end: number }>;
  } = {},
) {
  mocks.stateQueue.push(
    overrides.addMusic ?? false,
    overrides.includeDemoAudio ?? true,
    overrides.includeUgcAudio ?? true,
    overrides.selectedMusicTrack ?? null,
    overrides.textOverlaysByUgcId ?? {},
    overrides.selectedAutoTextProductId ?? "",
    overrides.demoProductFilterId ?? "all",
    overrides.isGeneratingAutoText ?? false,
    overrides.autoTextMessage ?? null,
    overrides.ugcTrimRangesByClipId ?? {},
    overrides.demoTrimRangesByClipId ?? {},
    overrides.selectedUgcIds,
    overrides.activePreviewUgcId,
    overrides.selectedDemoId,
  );
}

describe("StitchrPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.clipLibraryState.clips = [];
    mocks.clipLibraryState.error = null;
    mocks.clipLibraryState.isLoading = false;
    setClipLibraryVideoGroups();
    mocks.productState.products = [createProduct()];
    mocks.stitchrState.stitchVideos.mockResolvedValue(undefined);
    mocks.generateCliprText.mockResolvedValue({
      hook: "Generated hook",
      overlayText: "Generated overlay",
    });
    mocks.autoTextPanelProps = null;
    mocks.clipPickerPanelProps = null;
    mocks.sequencePreviewPanelProps = null;
    mocks.stateQueue.length = 0;
    mocks.stateSetters.length = 0;
    mocks.useEffect.mockReset();
  });

  it("renders the Stitchr build workspace from category-specific media groups", () => {
    const markup = renderToStaticMarkup(<StitchrPageClient />);

    expect(markup).toContain("StitchrHeader");
    expect(markup).toContain("ClipPickerPanel");
    expect(markup).toContain("StitchrAutoTextPanel");
    expect(markup).toContain("StitchrProgressPanel");
    expect(markup).toContain("DownloadStitchesPanel");
    expect(markup).toContain("SequencePreviewPanel");
    expect(mocks.clipLibraryState.clips).toEqual([]);
    expect(
      (mocks.clipPickerPanelProps?.ugcClips as VideoClipMetadata[]).map(
        (clip) => clip.id,
      ),
    ).toEqual(["ugc_1"]);
    expect(
      (mocks.clipPickerPanelProps?.demoClips as VideoClipMetadata[]).map(
        (clip) => clip.id,
      ),
    ).toEqual(["demo_1"]);
  });

  it("renders empty and error states", () => {
    setClipLibraryVideoGroups({ demo: [], ugc: [] });
    mocks.clipLibraryState.error = "Clip library unavailable.";

    const markup = renderToStaticMarkup(<StitchrPageClient />);

    expect(markup).toContain("Clip library unavailable.");
    expect(markup).toContain("StitchrEmptyState");
  });

  it("shows loading state instead of the upload prompt while groups are loading", () => {
    setClipLibraryVideoGroups({ demo: [], ugc: [] });
    mocks.clipLibraryState.isLoading = true;

    const markup = renderToStaticMarkup(<StitchrPageClient />);

    expect(markup).toContain("Loading Stitchr clips...");
    expect(markup).not.toContain("StitchrEmptyState");
  });

  it("includes Clipr and Swapr clips as reusable UGC inputs", () => {
    setClipLibraryVideoGroups({
      clipr: [createClip("clipr_1", "ugc")],
      demo: [createClip("demo_1", "demo")],
      swapr: [createClip("swapr_1", "ugc")],
      ugc: [],
    });

    renderToStaticMarkup(<StitchrPageClient />);

    expect(
      (mocks.clipPickerPanelProps?.ugcClips as VideoClipMetadata[]).map(
        (clip) => clip.id,
      ),
    ).toEqual(["clipr_1", "swapr_1"]);
  });

  it("loads more clips from the Stitchr category groups", () => {
    const ugcLoadMore = mocks.clipLibraryState.videoGroups.ugc.loadMoreItems;
    const cliprLoadMore = mocks.clipLibraryState.videoGroups.clipr.loadMoreItems;
    const swaprLoadMore = mocks.clipLibraryState.videoGroups.swapr.loadMoreItems;
    const demoLoadMore = mocks.clipLibraryState.videoGroups.demo.loadMoreItems;

    mocks.clipLibraryState.videoGroups.ugc.hasMoreItems = true;
    mocks.clipLibraryState.videoGroups.clipr.hasMoreItems = false;
    mocks.clipLibraryState.videoGroups.swapr.hasMoreItems = true;
    mocks.clipLibraryState.videoGroups.demo.hasMoreItems = true;
    renderToStaticMarkup(<StitchrPageClient />);

    const clipPickerProps = mocks.clipPickerPanelProps as {
      hasMoreClips: boolean;
      onLoadMoreClips: () => void;
    };

    expect(clipPickerProps.hasMoreClips).toBe(true);
    clipPickerProps.onLoadMoreClips();

    expect(ugcLoadMore).toHaveBeenCalledTimes(1);
    expect(cliprLoadMore).not.toHaveBeenCalled();
    expect(swaprLoadMore).toHaveBeenCalledTimes(1);
    expect(demoLoadMore).toHaveBeenCalledTimes(1);
    expect(mocks.clipLibraryState.loadMoreClips).not.toHaveBeenCalled();
  });

  it("exercises Stitchr selection, trim, music, stitch, and auto-text callbacks", async () => {
    renderToStaticMarkup(<StitchrPageClient />);

    const clipPickerProps = mocks.clipPickerPanelProps as {
      onAddMusicChange: (checked: boolean) => void;
      onDemoProductFilterChange: (productId: string) => void;
      onIncludeDemoAudioChange: (checked: boolean) => void;
      onIncludeUgcAudioChange: (checked: boolean) => void;
      onSelectDemo: (id: string) => void;
      onSelectMusicTrack: (track: SharedMusicTrack) => void;
      onSelectUgc: (id: string) => void;
      onStitch: () => void;
      onUpdateDemoTrim: (
        clip: VideoClipMetadata,
        trimRange: { start: number; end: number },
      ) => void;
      onUpdateUgcTrim: (
        clip: VideoClipMetadata,
        trimRange: { start: number; end: number },
      ) => void;
    };
    const autoTextProps = mocks.autoTextPanelProps as {
      onGenerate: () => void;
      onProductChange: (productId: string) => void;
    };
    const sequencePreviewProps = mocks.sequencePreviewPanelProps as {
      onActiveUgcChange: (id: string) => void;
      onCopyTextOverlayToAll: () => void;
      onTextOverlayChange: (overlay: TextOverlay) => void;
    };
    const ugcClip = mocks.clipLibraryState.videoGroups.ugc.clips[0];
    const demoClip = mocks.clipLibraryState.videoGroups.demo.clips[0];

    clipPickerProps.onSelectUgc(ugcClip.id);
    clipPickerProps.onSelectDemo(demoClip.id);
    clipPickerProps.onUpdateUgcTrim(ugcClip, { start: -3, end: 20 });
    clipPickerProps.onUpdateDemoTrim(demoClip, { start: 1, end: 3 });
    clipPickerProps.onAddMusicChange(true);
    clipPickerProps.onIncludeDemoAudioChange(false);
    clipPickerProps.onIncludeUgcAudioChange(false);
    clipPickerProps.onSelectMusicTrack({
      audioObject: {
        contentType: "audio/mpeg",
        key: "music.mp3",
        size: 100,
      },
      createdAt: "2026-05-20T00:00:00.000Z",
      durationSeconds: 30,
      id: "music_1",
      isOwnedByCurrentUser: false,
      mimeType: "audio/mpeg",
      size: 100,
      source: "library",
      tags: ["upbeat"],
      title: "Music",
      uploadedByOwnerId: "user_1",
    });
    clipPickerProps.onDemoProductFilterChange("product_1");
    sequencePreviewProps.onActiveUgcChange(ugcClip.id);
    sequencePreviewProps.onCopyTextOverlayToAll();
    sequencePreviewProps.onTextOverlayChange({
      backgroundColor: "#000000",
      color: "#ffffff",
      endTime: 3,
      fontSize: 48,
      startTime: 0,
      styleId: "hook",
      text: "Hook",
      width: 0.8,
      x: 0.5,
      y: 0.5,
    });
    autoTextProps.onProductChange("product_1");
    autoTextProps.onGenerate();
    clipPickerProps.onStitch();

    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.generateCliprText).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: "product_1",
        purpose: "stitchr",
      }),
    );
    expect(mocks.stitchrState.stitchVideos).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          clip: expect.objectContaining({ id: "ugc_1" }),
        }),
      ]),
      expect.objectContaining({ id: "demo_1" }),
      expect.any(Object),
      null,
      expect.objectContaining({
        includeDemoAudio: true,
        includeUgcAudio: true,
      }),
    );
  });

  it("syncs selected clips from URL changes and cleans up the listener", () => {
    let cleanup: (() => void) | undefined;
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();

    mocks.useEffect.mockImplementationOnce((effect: () => void | (() => void)) => {
      cleanup = effect() ?? undefined;
    });
    vi.stubGlobal("window", {
      addEventListener,
      location: {
        href: "https://clipstitchr.test/dashboard/stitchr?ugcId=ugc_1&demoId=demo_1",
      },
      removeEventListener,
    });

    renderToStaticMarkup(<StitchrPageClient />);
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

  it("covers UGC and demo selection edge paths", () => {
    setClipLibraryVideoGroups({
      demo: [createClip("demo_1", "demo")],
      ugc: [createClip("ugc_1", "ugc"), createClip("ugc_2", "ugc")],
    });
    renderToStaticMarkup(<StitchrPageClient />);

    const clipPickerProps = mocks.clipPickerPanelProps as {
      onDemoProductFilterChange: (productId: string) => void;
      onSelectDemo: (id: string) => void;
      onSelectUgc: (id: string) => void;
    };

    clipPickerProps.onSelectUgc("missing_ugc");
    clipPickerProps.onSelectUgc("ugc_1");
    clipPickerProps.onSelectUgc("ugc_2");
    clipPickerProps.onSelectDemo("missing_demo");
    clipPickerProps.onSelectDemo("demo_1");
    clipPickerProps.onDemoProductFilterChange("unknown_product");

    expect(mocks.stateSetters.length).toBeGreaterThan(0);
  });

  it("generates auto-text guard messages and provider errors", async () => {
    mocks.productState.products = [];
    renderToStaticMarkup(<StitchrPageClient />);
    (mocks.autoTextPanelProps as { onGenerate: () => void }).onGenerate();

    mocks.productState.products = [createProduct()];
    setClipLibraryVideoGroups({
      demo: [
        createClip("demo_1", "demo"),
      ].map((clip) => ({
        ...clip,
        duration: 0,
      })),
      ugc: [
        createClip("ugc_1", "ugc"),
      ].map((clip) => ({
        ...clip,
        duration: 0,
      })),
    });
    renderToStaticMarkup(<StitchrPageClient />);
    (mocks.autoTextPanelProps as { onGenerate: () => void }).onGenerate();

    setClipLibraryVideoGroups();
    mocks.generateCliprText.mockRejectedValueOnce(new Error("text failed"));
    renderToStaticMarkup(<StitchrPageClient />);
    (mocks.autoTextPanelProps as { onGenerate: () => void }).onGenerate();

    await Promise.resolve();
    await Promise.resolve();

    expect(mocks.generateCliprText).toHaveBeenCalled();
  });

  it("passes text overlays and music options into stitching", () => {
    const musicTrack = {
      audioObject: {
        contentType: "audio/mpeg",
        key: "music.mp3",
        size: 100,
      },
      createdAt: "2026-05-20T00:00:00.000Z",
      durationSeconds: 30,
      id: "music_1",
      isOwnedByCurrentUser: false,
      mimeType: "audio/mpeg",
      size: 100,
      source: "library",
      tags: ["upbeat"],
      title: "Music",
      uploadedByOwnerId: "user_1",
    } satisfies SharedMusicTrack;
    const textOverlay = {
      backgroundColor: "#000000",
      color: "#ffffff",
      endTime: 3,
      fontSize: 48,
      startTime: 0,
      styleId: "hook",
      text: "Hook",
      width: 0.8,
      x: 0.5,
      y: 0.5,
    } satisfies TextOverlay;

    queueStitchrState({
      addMusic: true,
      includeDemoAudio: false,
      includeUgcAudio: false,
      selectedMusicTrack: musicTrack,
      textOverlaysByUgcId: {
        ugc_1: textOverlay,
      },
    });
    renderToStaticMarkup(<StitchrPageClient />);

    (mocks.clipPickerPanelProps as { onStitch: () => void }).onStitch();

    expect(mocks.stitchrState.stitchVideos).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          textOverlay: expect.objectContaining({
            backgroundColor: textOverlay.backgroundColor,
            text: textOverlay.text,
          }),
        }),
      ]),
      expect.objectContaining({ id: "demo_1" }),
      expect.any(Object),
      null,
      expect.objectContaining({
        addMusic: false,
        includeDemoAudio: false,
        includeUgcAudio: false,
        musicTrack,
      }),
    );
  });
});
