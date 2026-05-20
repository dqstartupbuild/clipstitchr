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
    loadClip: vi.fn(),
    refresh: vi.fn(),
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
}));

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

describe("StitchrPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.clipLibraryState.clips = [
      createClip("ugc_1", "ugc"),
      createClip("demo_1", "demo"),
    ];
    mocks.clipLibraryState.error = null;
    mocks.productState.products = [createProduct()];
    mocks.stitchrState.stitchVideos.mockResolvedValue(undefined);
    mocks.generateCliprText.mockResolvedValue({
      hook: "Generated hook",
      overlayText: "Generated overlay",
    });
    mocks.autoTextPanelProps = null;
    mocks.clipPickerPanelProps = null;
    mocks.sequencePreviewPanelProps = null;
  });

  it("renders the Stitchr build workspace when UGC and demo clips exist", () => {
    const markup = renderToStaticMarkup(<StitchrPageClient />);

    expect(markup).toContain("StitchrHeader");
    expect(markup).toContain("ClipPickerPanel");
    expect(markup).toContain("StitchrAutoTextPanel");
    expect(markup).toContain("StitchrProgressPanel");
    expect(markup).toContain("DownloadStitchesPanel");
    expect(markup).toContain("SequencePreviewPanel");
  });

  it("renders empty and error states", () => {
    mocks.clipLibraryState.clips = [];
    mocks.clipLibraryState.error = "Clip library unavailable.";

    const markup = renderToStaticMarkup(<StitchrPageClient />);

    expect(markup).toContain("Clip library unavailable.");
    expect(markup).toContain("StitchrEmptyState");
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
      onTextOverlayChange: (overlay: TextOverlay) => void;
    };
    const ugcClip = mocks.clipLibraryState.clips[0];
    const demoClip = mocks.clipLibraryState.clips[1];

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
});
