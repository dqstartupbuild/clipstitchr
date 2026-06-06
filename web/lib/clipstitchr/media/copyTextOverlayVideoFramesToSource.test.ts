import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CanvasSource, Input } from "mediabunny";
import { copyTextOverlayVideoFramesToSource } from "@/lib/clipstitchr/media/copyTextOverlayVideoFramesToSource";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

const mocks = vi.hoisted(() => ({
  canvasSinkOptions: null as Record<string, unknown> | null,
  drawTextOverlay: vi.fn(),
  frames: [] as MockFrame[],
}));

type MockFrame = {
  canvas: object;
  duration: number;
  timestamp: number;
};

vi.mock("mediabunny", () => ({
  CanvasSink: vi.fn(function CanvasSink(_track, options) {
    mocks.canvasSinkOptions = options;

    return {
      canvases: async function* canvases() {
        yield* mocks.frames;
      },
    };
  }),
}));

vi.mock("@/lib/clipstitchr/media/drawTextOverlay", () => ({
  drawTextOverlay: mocks.drawTextOverlay,
}));

function createInput(track: object | null): Input {
  return {
    getPrimaryVideoTrack: vi.fn().mockResolvedValue(track),
  } as unknown as Input;
}

function createOverlay(): TextOverlay {
  return {
    endTime: 8,
    fontSize: 0.08,
    startTime: 0,
    styleId: "caption",
    text: "Hello",
    width: 0.8,
    x: 0.1,
    y: 0.1,
  };
}

describe("copyTextOverlayVideoFramesToSource", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.canvasSinkOptions = null;
    mocks.frames = [];
  });

  it("draws text overlays onto retimed canvas frames", async () => {
    const track = {
      computeDuration: vi.fn().mockResolvedValue(20),
      getDisplayHeight: vi.fn().mockResolvedValue(1920),
      getDisplayWidth: vi.fn().mockResolvedValue(1080),
      getFirstTimestamp: vi.fn().mockResolvedValue(10),
    };
    const context = {
      clearRect: vi.fn(),
      drawImage: vi.fn(),
    };
    const source = {
      add: vi.fn().mockResolvedValue(undefined),
    } as unknown as CanvasSource;
    const progress = vi.fn();

    mocks.frames = [
      { canvas: {}, duration: 3, timestamp: 12 },
      { canvas: {}, duration: 5, timestamp: 17 },
    ];

    await expect(
      copyTextOverlayVideoFramesToSource({
        input: createInput(track),
        onProgress: progress,
        renderContext: { canvas: {}, context } as never,
        source,
        textOverlay: createOverlay(),
        timelineOffset: 5,
        trimRange: { start: 2, end: 8 },
      }),
    ).resolves.toEqual({ endTimestamp: 11 });

    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 1080, 1920);
    expect(context.drawImage).toHaveBeenCalledWith({}, 0, 0, 1080, 1920);
    expect(mocks.drawTextOverlay).toHaveBeenCalledWith(
      context,
      expect.objectContaining({ text: "Hello" }),
      5,
    );
    expect(source.add).toHaveBeenNthCalledWith(1, 5, 3, { keyFrame: true });
    expect(source.add).toHaveBeenNthCalledWith(2, 10, 1, undefined);
    expect(progress).toHaveBeenLastCalledWith(1);
  });

  it("compresses overlay frame timing for 2x playback", async () => {
    const track = {
      computeDuration: vi.fn().mockResolvedValue(20),
      getDisplayHeight: vi.fn().mockResolvedValue(1920),
      getDisplayWidth: vi.fn().mockResolvedValue(1080),
      getFirstTimestamp: vi.fn().mockResolvedValue(10),
    };
    const context = {
      clearRect: vi.fn(),
      drawImage: vi.fn(),
    };
    const source = {
      add: vi.fn().mockResolvedValue(undefined),
    } as unknown as CanvasSource;

    mocks.frames = [
      { canvas: {}, duration: 2, timestamp: 12 },
      { canvas: {}, duration: 4, timestamp: 16 },
    ];

    await expect(
      copyTextOverlayVideoFramesToSource({
        input: createInput(track),
        playbackRate: 2,
        renderContext: { canvas: {}, context } as never,
        source,
        textOverlay: createOverlay(),
        timelineOffset: 5,
        trimRange: { start: 2, end: 8 },
      }),
    ).resolves.toEqual({ endTimestamp: 8 });

    expect(source.add).toHaveBeenNthCalledWith(1, 5, 1, { keyFrame: true });
    expect(source.add).toHaveBeenNthCalledWith(2, 7, 1, undefined);
    expect(mocks.drawTextOverlay).toHaveBeenNthCalledWith(
      1,
      context,
      expect.objectContaining({ text: "Hello" }),
      5,
    );
    expect(mocks.drawTextOverlay).toHaveBeenNthCalledWith(
      2,
      context,
      expect.objectContaining({ text: "Hello" }),
      7,
    );
  });

  it("passes crop bounds to the Media Bunny canvas sink", async () => {
    const track = {
      computeDuration: vi.fn().mockResolvedValue(20),
      getDisplayHeight: vi.fn().mockResolvedValue(2000),
      getDisplayWidth: vi.fn().mockResolvedValue(1000),
      getFirstTimestamp: vi.fn().mockResolvedValue(0),
    };
    const context = {
      clearRect: vi.fn(),
      drawImage: vi.fn(),
    };
    const source = {
      add: vi.fn().mockResolvedValue(undefined),
    } as unknown as CanvasSource;

    await expect(
      copyTextOverlayVideoFramesToSource({
        cropBounds: {
          bottom: 0.2,
          left: 0.05,
          right: 0.15,
          top: 0.1,
        },
        input: createInput(track),
        renderContext: { canvas: {}, context } as never,
        source,
        timelineOffset: 0,
        trimRange: { start: 0, end: 1 },
      }),
    ).resolves.toEqual({ endTimestamp: 0 });

    expect(mocks.canvasSinkOptions).toMatchObject({
      crop: {
        height: 1400,
        left: 50,
        top: 200,
        width: 800,
      },
      fit: "cover",
      height: 1920,
      width: 1080,
    });
  });

  it("throws when the input has no video track", async () => {
    await expect(
      copyTextOverlayVideoFramesToSource({
        input: createInput(null),
        renderContext: { canvas: {}, context: {} } as never,
        source: { add: vi.fn() } as unknown as CanvasSource,
        textOverlay: createOverlay(),
        timelineOffset: 0,
        trimRange: { start: 0, end: 1 },
      }),
    ).rejects.toThrow("A normalized clip was missing its video track.");
  });
});
