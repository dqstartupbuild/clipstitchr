import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CanvasSource, Input } from "mediabunny";
import { copyTextOverlayVideoFramesToSource } from "@/lib/clipstitchr/media/copyTextOverlayVideoFramesToSource";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

const mocks = vi.hoisted(() => ({
  drawTextOverlay: vi.fn(),
  frames: [] as MockFrame[],
}));

type MockFrame = {
  canvas: object;
  duration: number;
  timestamp: number;
};

vi.mock("mediabunny", () => ({
  CanvasSink: vi.fn(function CanvasSink() {
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
    mocks.frames = [];
  });

  it("draws text overlays onto retimed canvas frames", async () => {
    const track = {
      computeDuration: vi.fn().mockResolvedValue(20),
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
