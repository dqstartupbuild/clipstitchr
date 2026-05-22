import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LongrPageClient } from "@/app/dashboard/longr/LongrPageClient";
import type { LongrMusicClip } from "@/lib/clipstitchr/types/LongrMusicClip";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
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
  },
  longrState: {
    buildLongrVideo: vi.fn(),
    error: null,
    longrVideo: null,
    progress: 0,
    status: "idle",
  },
  productState: {
    error: null as string | null,
    products: [] as ProductProfile[],
  },
  clipPickerPanelProps: null as Record<string, unknown> | null,
  musicPanelProps: null as Record<string, unknown> | null,
  stateQueue: [] as unknown[],
  stateSetters: [] as ReturnType<typeof vi.fn>[],
  timelineStripProps: null as Record<string, unknown> | null,
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
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

vi.mock("@/app/_components/dashboard/DashboardShell", () => ({
  DashboardShell: ({ children }: ChildrenProps) => children,
}));

vi.mock("@/app/_components/dashboard/DashboardPageHeader", () => ({
  DashboardPageHeader: ({ title }: { title: string }) => `Header:${title}`,
}));

vi.mock("@/app/_components/longr/LongrClipPickerPanel", () => ({
  LongrClipPickerPanel: (props: Record<string, unknown>) => {
    mocks.clipPickerPanelProps = props;
    return "LongrClipPickerPanel";
  },
}));

vi.mock("@/app/_components/longr/LongrTimelineStrip", () => ({
  LongrTimelineStrip: (props: Record<string, unknown>) => {
    mocks.timelineStripProps = props;
    return "LongrTimelineStrip";
  },
}));

vi.mock("@/app/_components/longr/LongrMusicPanel", () => ({
  LongrMusicPanel: (props: Record<string, unknown>) => {
    mocks.musicPanelProps = props;
    return "LongrMusicPanel";
  },
}));

vi.mock("@/app/_components/longr/LongrProgressPanel", () => ({
  LongrProgressPanel: () => "LongrProgressPanel",
}));

vi.mock("@/app/_components/longr/LongrBuildResult", () => ({
  LongrBuildResult: () => "LongrBuildResult",
}));

vi.mock("@/app/_components/longr/LongrPreviewPanel", () => ({
  LongrPreviewPanel: () => "LongrPreviewPanel",
}));

vi.mock("@/lib/clipstitchr/hooks/useClipLibrary", () => ({
  useClipLibrary: () => mocks.clipLibraryState,
}));

vi.mock("@/lib/clipstitchr/hooks/useLongr", () => ({
  useLongr: () => mocks.longrState,
}));

vi.mock("@/lib/clipstitchr/hooks/useProducts", () => ({
  useProducts: () => mocks.productState,
}));

function createClip(
  id: string,
  clipType: "ugc" | "demo",
  overrides: Partial<VideoClipMetadata> = {},
): VideoClipMetadata {
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
    ...overrides,
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

function createTrack(): SharedMusicTrack {
  return {
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
  };
}

function createMusicClip(overrides: Partial<LongrMusicClip> = {}): LongrMusicClip {
  return {
    durationSeconds: 8,
    id: "music_clip_1",
    sourceEndSeconds: 8,
    sourceStartSeconds: 0,
    timelineStartSeconds: 0,
    trackId: "music_1",
    trackTitle: "Music",
    volume: 0.8,
    ...overrides,
  };
}

function queueLongrState(
  overrides: {
    demoProductFilterId?: string;
    musicClips?: LongrMusicClip[];
    selectedClipIds?: string[];
    selectionError?: string | null;
  } = {},
) {
  mocks.stateQueue.push(
    overrides.selectedClipIds ?? [],
    overrides.demoProductFilterId ?? "all",
    overrides.musicClips ?? [],
    overrides.selectionError ?? null,
  );
}

describe("LongrPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.clipLibraryState.clips = [
      createClip("ugc_1", "ugc"),
      createClip("demo_1", "demo"),
    ];
    mocks.clipLibraryState.error = null;
    mocks.productState.error = null;
    mocks.productState.products = [createProduct()];
    mocks.longrState.buildLongrVideo.mockResolvedValue(undefined);
    mocks.clipPickerPanelProps = null;
    mocks.musicPanelProps = null;
    mocks.stateQueue.length = 0;
    mocks.stateSetters.length = 0;
    mocks.timelineStripProps = null;
  });

  it("renders the Longr build workspace", () => {
    const markup = renderToStaticMarkup(<LongrPageClient />);

    expect(markup).toContain("Header:Longr");
    expect(markup).toContain("LongrClipPickerPanel");
    expect(markup).toContain("LongrTimelineStrip");
    expect(markup).toContain("LongrMusicPanel");
    expect(markup).toContain("LongrProgressPanel");
    expect(markup).toContain("LongrBuildResult");
    expect(markup).toContain("LongrPreviewPanel");
  });

  it("surfaces library and product errors", () => {
    mocks.clipLibraryState.error = "Clip library unavailable.";

    expect(renderToStaticMarkup(<LongrPageClient />)).toContain(
      "Clip library unavailable.",
    );

    mocks.clipLibraryState.error = null;
    mocks.productState.error = "Products unavailable.";

    expect(renderToStaticMarkup(<LongrPageClient />)).toContain(
      "Products unavailable.",
    );
  });

  it("exercises Longr clip, build, and music callbacks", () => {
    renderToStaticMarkup(<LongrPageClient />);

    const clipPickerProps = mocks.clipPickerPanelProps as {
      onAddClip: (clip: VideoClipMetadata) => void;
      onBuild: () => void;
      onDemoProductFilterChange: (productId: string) => void;
      onRemoveClip: (id: string) => void;
    };
    const timelineProps = mocks.timelineStripProps as {
      onMoveClip: (draggedId: string, targetId: string) => void;
      onRemoveClip: (id: string) => void;
    };
    const musicProps = mocks.musicPanelProps as {
      onAddTrack: (track: SharedMusicTrack) => void;
      onDuplicate: (id: string) => void;
      onRemove: (id: string) => void;
      onUpdate: (id: string, patch: Record<string, unknown>) => void;
    };
    const track = createTrack();

    clipPickerProps.onDemoProductFilterChange("product_1");
    clipPickerProps.onAddClip(mocks.clipLibraryState.clips[0]);
    clipPickerProps.onRemoveClip("ugc_1");
    timelineProps.onMoveClip("ugc_1", "demo_1");
    timelineProps.onRemoveClip("demo_1");
    musicProps.onAddTrack(track);
    musicProps.onUpdate("music_1", { volume: 0.5 });
    musicProps.onDuplicate("music_1");
    musicProps.onRemove("music_1");
    clipPickerProps.onBuild();

    expect(mocks.longrState.buildLongrVideo).toHaveBeenCalledWith([], []);
  });

  it("sets a selection error when the sequence would exceed the Longr duration cap", () => {
    renderToStaticMarkup(<LongrPageClient />);

    const clipPickerProps = mocks.clipPickerPanelProps as {
      onAddClip: (clip: VideoClipMetadata) => void;
    };

    clipPickerProps.onAddClip(
      createClip("very_long", "ugc", {
        duration: 400,
      }),
    );

    expect(mocks.longrState.buildLongrVideo).not.toHaveBeenCalled();
  });

  it("builds selected clips with queued music clips", () => {
    const musicClip = createMusicClip();

    queueLongrState({
      musicClips: [musicClip],
      selectedClipIds: ["ugc_1", "demo_1"],
    });
    renderToStaticMarkup(<LongrPageClient />);

    const clipPickerProps = mocks.clipPickerPanelProps as {
      onBuild: () => void;
    };

    clipPickerProps.onBuild();

    expect(mocks.longrState.buildLongrVideo).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          clip: expect.objectContaining({ id: "ugc_1" }),
          loadClip: expect.any(Function),
        }),
        expect.objectContaining({
          clip: expect.objectContaining({ id: "demo_1" }),
          loadClip: expect.any(Function),
        }),
      ],
      [musicClip],
    );
  });

  it("covers duplicate, move, and music edit edge paths", () => {
    const musicClip = createMusicClip();

    queueLongrState({
      musicClips: [musicClip],
      selectedClipIds: ["ugc_1", "demo_1"],
    });
    renderToStaticMarkup(<LongrPageClient />);

    const clipPickerProps = mocks.clipPickerPanelProps as {
      onAddClip: (clip: VideoClipMetadata) => void;
    };
    const timelineProps = mocks.timelineStripProps as {
      onMoveClip: (draggedId: string, targetId: string) => void;
    };
    const musicProps = mocks.musicPanelProps as {
      onDuplicate: (id: string) => void;
      onUpdate: (id: string, patch: Partial<LongrMusicClip>) => void;
    };

    clipPickerProps.onAddClip(mocks.clipLibraryState.clips[0]);
    timelineProps.onMoveClip("missing", "demo_1");
    timelineProps.onMoveClip("demo_1", "ugc_1");
    musicProps.onDuplicate("missing_music");
    musicProps.onDuplicate("music_clip_1");
    musicProps.onUpdate("music_clip_1", {
      sourceEndSeconds: 40,
      volume: 0.2,
    });

    expect(mocks.stateSetters.length).toBeGreaterThan(0);
  });
});
