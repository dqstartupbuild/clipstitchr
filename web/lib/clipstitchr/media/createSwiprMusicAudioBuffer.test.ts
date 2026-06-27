import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSwiprMusicAudioBuffer } from "@/lib/clipstitchr/media/createSwiprMusicAudioBuffer";

const mocks = vi.hoisted(() => ({
  decodeAudioBlob: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/media/decodeAudioBlob", () => ({
  decodeAudioBlob: mocks.decodeAudioBlob,
}));

function createOfflineAudioContextMock() {
  const starts: Array<[number, number, number]> = [];
  const gains: number[] = [];
  const renderedBuffer = { duration: 2.5 };
  const OfflineAudioContextMock = vi.fn(function OfflineAudioContext() {
    const destination = {};

    return {
      destination,
      createBufferSource: vi.fn(() => ({
        buffer: null,
        connect: vi.fn(),
        start: vi.fn((startTime: number, offset: number, duration: number) => {
          starts.push([startTime, offset, duration]);
        }),
      })),
      createGain: vi.fn(() => ({
        gain: {
          set value(nextValue: number) {
            gains.push(nextValue);
          },
        },
        connect: vi.fn(() => destination),
      })),
      startRendering: vi.fn(async () => renderedBuffer),
    };
  });

  return {
    OfflineAudioContextMock,
    gains,
    renderedBuffer,
    starts,
  };
}

describe("createSwiprMusicAudioBuffer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.decodeAudioBlob.mockResolvedValue({ duration: 1 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loops short music across the full swipe video duration", async () => {
    const context = createOfflineAudioContextMock();

    vi.stubGlobal("OfflineAudioContext", context.OfflineAudioContextMock);

    await expect(
      createSwiprMusicAudioBuffer({
        duration: 2.5,
        musicBlob: new Blob(["music"], { type: "audio/mpeg" }),
        volume: 0.6,
      }),
    ).resolves.toBe(context.renderedBuffer);

    expect(context.OfflineAudioContextMock).toHaveBeenCalledWith(
      2,
      120000,
      48000,
    );
    expect(context.starts).toEqual([
      [0, 0, 1],
      [1, 0, 1],
      [2, 0, 0.5],
    ]);
    expect(context.gains).toEqual([0.6]);
  });
});
