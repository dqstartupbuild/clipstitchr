import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderSavedStitchBlob } from "@/lib/clipstitchr/client/renderSavedStitchBlob";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

const mocks = vi.hoisted(() => ({
  stitchNormalizedVideos: vi.fn(),
  stitchNormalizedVideosWithTextOverlay: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/media/stitchNormalizedVideos", () => ({
  stitchNormalizedVideos: mocks.stitchNormalizedVideos,
}));

vi.mock("@/lib/clipstitchr/media/stitchNormalizedVideosWithTextOverlay", () => ({
  stitchNormalizedVideosWithTextOverlay:
    mocks.stitchNormalizedVideosWithTextOverlay,
}));

function createClip(id: string, duration: number): VideoClip {
  return {
    aspectRatio: 9 / 16,
    blob: new Blob([id], { type: "video/mp4" }),
    clipType: id.startsWith("demo") ? "demo" : "ugc",
    createdAt: "2026-05-20T00:00:00.000Z",
    duration,
    hasAudio: true,
    height: 1920,
    id,
    mimeType: "video/mp4",
    name: id,
    originalName: `${id}.mp4`,
    originalSize: 100,
    size: 100,
    sourceMimeType: "video/mp4",
    updatedAt: "2026-05-20T00:00:00.000Z",
    videoObject: {
      contentType: "video/mp4",
      key: `${id}.mp4`,
      size: 100,
    },
    width: 1080,
  };
}

function createStitch(overrides: Partial<Stitch> = {}): Stitch {
  return {
    createdAt: "2026-05-20T00:00:00.000Z",
    demoClipId: "demo_1",
    duration: 10,
    id: "stitch_1",
    includeDemoAudio: false,
    includeUgcAudio: true,
    name: "Stitch",
    ugcClipId: "ugc_1",
    updatedAt: "2026-05-20T00:00:00.000Z",
    ...overrides,
  } as Stitch;
}

describe("renderSavedStitchBlob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.stitchNormalizedVideos.mockResolvedValue({
      blob: new Blob(["plain"], { type: "video/mp4" }),
    });
    mocks.stitchNormalizedVideosWithTextOverlay.mockResolvedValue({
      blob: new Blob(["text"], { type: "video/mp4" }),
    });
  });

  it("renders saved stitches without text overlays through the plain stitcher", async () => {
    const loadClip = vi.fn(async (id: string) =>
      id === "ugc_1" ? createClip("ugc_1", 8) : createClip("demo_1", 5),
    );
    const onProgress = vi.fn();

    await expect(
      renderSavedStitchBlob({
        loadClip,
        onProgress,
        stitch: createStitch({
          demoTrimRange: { start: -5, end: 9 },
          ugcTrimRange: { start: 1, end: 20 },
        }),
      }),
    ).resolves.toEqual(expect.any(Blob));

    expect(mocks.stitchNormalizedVideos).toHaveBeenCalledWith(
      expect.objectContaining({ id: "ugc_1" }),
      expect.objectContaining({ id: "demo_1" }),
      expect.objectContaining({
        demoPlaybackRate: 1,
        demoTrimRange: { start: 0, end: 5 },
        includeDemoAudio: false,
        includeUgcAudio: true,
        onProgress,
        ugcPlaybackRate: 1,
        ugcTrimRange: { start: 1, end: 8 },
      }),
    );
  });

  it("uses the text overlay stitcher when saved text is non-empty", async () => {
    const loadClip = vi.fn(async (id: string) =>
      id === "ugc_1" ? createClip("ugc_1", 4) : createClip("demo_1", 6),
    );

    await renderSavedStitchBlob({
      loadClip,
      stitch: createStitch({
        demoPlaybackRate: 2,
        textOverlay: {
          backgroundColor: "#000000",
          color: "#ffffff",
          endTime: 99,
          fontSize: 48,
          startTime: -1,
          styleId: "hook",
          text: " Hook ",
          width: 0.8,
          x: 0.5,
          y: 0.5,
        },
        ugcPlaybackRate: 2,
      }),
    });

    expect(mocks.stitchNormalizedVideos).not.toHaveBeenCalled();
    expect(mocks.stitchNormalizedVideosWithTextOverlay).toHaveBeenCalledWith(
      expect.objectContaining({ id: "ugc_1" }),
      expect.objectContaining({ id: "demo_1" }),
      expect.objectContaining({
        demoPlaybackRate: 2,
        textOverlay: expect.objectContaining({
          text: " Hook ",
        }),
        ugcPlaybackRate: 2,
      }),
    );
  });

  it("rejects when source clips cannot be loaded", async () => {
    await expect(
      renderSavedStitchBlob({
        loadClip: vi.fn(async () => null),
        stitch: createStitch(),
      }),
    ).rejects.toThrow("Unable to load the source videos for this stitch.");
  });
});
