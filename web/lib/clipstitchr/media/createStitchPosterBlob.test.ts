import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createStitchPosterBlob } from "@/lib/clipstitchr/media/createStitchPosterBlob";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

const mocks = vi.hoisted(() => ({
  drawTextOverlays: vi.fn(),
  drawVideoFrameToCanvas: vi.fn(),
  encodeCanvasAsPosterBlob: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/media/drawTextOverlays", () => ({
  drawTextOverlays: mocks.drawTextOverlays,
}));

vi.mock("@/lib/clipstitchr/media/drawVideoFrameToCanvas", () => ({
  drawVideoFrameToCanvas: mocks.drawVideoFrameToCanvas,
}));

vi.mock("@/lib/clipstitchr/media/encodeCanvasAsPosterBlob", () => ({
  encodeCanvasAsPosterBlob: mocks.encodeCanvasAsPosterBlob,
}));

function createClip(id: string, duration = 10): VideoClip {
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
    tags: [],
    updatedAt: "2026-05-20T00:00:00.000Z",
    videoObject: {
      contentType: "video/mp4",
      key: `${id}.mp4`,
      size: 100,
    },
    width: 1080,
  };
}

function createCanvas() {
  return {
    getContext: vi.fn(() => ({ canvas: {} })),
    height: 0,
    width: 0,
  };
}

describe("createStitchPosterBlob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.drawVideoFrameToCanvas.mockResolvedValue(undefined);
    mocks.encodeCanvasAsPosterBlob.mockResolvedValue(
      new Blob(["poster"], { type: "image/jpeg" }),
    );
    vi.stubGlobal("document", {
      createElement: vi.fn(() => createCanvas()),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps edited UGC timeline time past removed source ranges before drawing", async () => {
    await createStitchPosterBlob({
      demoClip: createClip("demo_1"),
      demoTrimRange: { start: 0, end: 4 },
      duration: 8,
      textOverlay: {
        endTime: 6,
        fontSize: 0.04,
        startTime: 3,
        styleId: "hook",
        text: "Hook",
        width: 0.8,
        x: 0.5,
        y: 0.2,
      },
      ugcClip: createClip("ugc_1"),
      ugcQuickEdit: {
        removeRanges: [{ start: 2, end: 5, reason: "Slow loading screen" }],
      },
      ugcTrimRange: { start: 0, end: 8 },
    });

    expect(mocks.drawVideoFrameToCanvas).toHaveBeenCalledWith(
      expect.objectContaining({
        time: 6,
      }),
    );
    expect(mocks.drawTextOverlays).toHaveBeenCalled();
  });

  it("maps edited demo timeline time with demo remove ranges", async () => {
    await createStitchPosterBlob({
      demoClip: createClip("demo_1"),
      demoQuickEdit: {
        removeRanges: [{ start: 1, end: 3, reason: "Loading state" }],
      },
      demoTrimRange: { start: 0, end: 8 },
      duration: 11,
      textOverlay: {
        endTime: 10,
        fontSize: 0.04,
        startTime: 7,
        styleId: "hook",
        text: "Hook",
        width: 0.8,
        x: 0.5,
        y: 0.2,
      },
      ugcClip: createClip("ugc_1"),
      ugcQuickEdit: {
        removeRanges: [{ start: 2, end: 5, reason: "Slow loading screen" }],
      },
      ugcTrimRange: { start: 0, end: 8 },
    });

    expect(mocks.drawVideoFrameToCanvas).toHaveBeenCalledWith(
      expect.objectContaining({
        time: 4,
      }),
    );
  });
});
