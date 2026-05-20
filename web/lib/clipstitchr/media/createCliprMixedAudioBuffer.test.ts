import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCliprMixedAudioBuffer } from "@/lib/clipstitchr/media/createCliprMixedAudioBuffer";

const mocks = vi.hoisted(() => ({
  decodeAudioBlob: vi.fn(),
}));

vi.mock("mediabunny", () => ({
  AudioBufferSink: vi.fn(function AudioBufferSink(track: {
    buffers: () => AsyncIterable<unknown>;
  }) {
    return {
      buffers: track.buffers,
    };
  }),
}));

vi.mock("@/lib/clipstitchr/media/decodeAudioBlob", () => ({
  decodeAudioBlob: mocks.decodeAudioBlob,
}));

function createOfflineAudioContextMock() {
  const starts: Array<[number, number, number]> = [];
  const gains: number[] = [];
  const renderedBuffer = { duration: 3 };
  const OfflineAudioContextMock = vi.fn(function OfflineAudioContext() {
    const destination = {};

    return {
      destination,
      createBufferSource: vi.fn(() => ({
        buffer: null,
        connect: vi.fn((gain) => gain),
        start: vi.fn((startTime: number, offset: number, duration: number) => {
          starts.push([startTime, offset, duration]);
        }),
      })),
      createGain: vi.fn(() => {
        const gain = {
          gain: {
            set value(nextValue: number) {
              gains.push(nextValue);
            },
          },
          connect: vi.fn(() => destination),
        };

        return gain;
      }),
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

async function* createAudioBuffers(
  buffers: Array<{ duration: number; timestamp: number }>,
) {
  for (const buffer of buffers) {
    yield {
      buffer: { id: `buffer-${buffer.timestamp}` },
      duration: buffer.duration,
      timestamp: buffer.timestamp,
    };
  }
}

describe("createCliprMixedAudioBuffer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.decodeAudioBlob.mockResolvedValue({ duration: 10 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("adds music under source audio and truncates buffers to the export duration", async () => {
    const context = createOfflineAudioContextMock();
    const audioTrack = {
      buffers: vi.fn(() =>
        createAudioBuffers([
          { duration: 1, timestamp: 2.5 },
          { duration: 1, timestamp: 10 },
        ]),
      ),
      getFirstTimestamp: vi.fn(async () => 2),
    };
    const videoInput = {
      getPrimaryAudioTrack: vi.fn(async () => audioTrack),
    };

    vi.stubGlobal("OfflineAudioContext", context.OfflineAudioContextMock);

    await expect(
      createCliprMixedAudioBuffer({
        duration: 2,
        musicBlob: new Blob(["music"], { type: "audio/mpeg" }),
        videoInput: videoInput as never,
        volume: 0.5,
      }),
    ).resolves.toBe(context.renderedBuffer);

    expect(context.OfflineAudioContextMock).toHaveBeenCalledWith(2, 96000, 48000);
    expect(context.starts).toEqual([
      [0, 0, 2],
      [0.5, 0, 1],
    ]);
    expect(context.gains).toEqual([0.09, 1]);
  });

  it("plays music at standalone gain when the video has no source audio", async () => {
    const context = createOfflineAudioContextMock();
    const videoInput = {
      getPrimaryAudioTrack: vi.fn(async () => null),
    };

    vi.stubGlobal("OfflineAudioContext", context.OfflineAudioContextMock);

    await createCliprMixedAudioBuffer({
      duration: 4,
      musicBlob: new Blob(["music"], { type: "audio/mpeg" }),
      videoInput: videoInput as never,
      volume: 2,
    });

    expect(context.starts).toEqual([[0, 0, 4]]);
    expect(context.gains).toEqual([0.35]);
  });
});
