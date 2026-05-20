import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createLongrMixedAudioBuffer } from "@/lib/clipstitchr/media/createLongrMixedAudioBuffer";

const mocks = vi.hoisted(() => ({
  decodeAudioBlob: vi.fn(),
}));

vi.mock("mediabunny", () => ({
  AudioBufferSink: vi.fn(function AudioBufferSink(track: {
    buffers: (start: number, end: number) => AsyncIterable<unknown>;
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
  const renderedBuffer = { duration: 2 };
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

describe("createLongrMixedAudioBuffer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.decodeAudioBlob.mockResolvedValue({ duration: 5 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("mixes trimmed source audio with clamped music clips", async () => {
    const context = createOfflineAudioContextMock();
    const audioTrack = {
      buffers: vi.fn(() =>
        createAudioBuffers([
          { duration: 0.5, timestamp: 1.2 },
          { duration: 2, timestamp: 2.2 },
        ]),
      ),
      getFirstTimestamp: vi.fn(async () => 1),
    };
    const inputs = [
      {
        getPrimaryAudioTrack: vi.fn(async () => audioTrack),
      },
    ];

    vi.stubGlobal("OfflineAudioContext", context.OfflineAudioContextMock);

    await expect(
      createLongrMixedAudioBuffer({
        inputs: inputs as never,
        musicClips: [
          {
            blob: new Blob(["music"], { type: "audio/mpeg" }),
            durationSeconds: 5,
            id: "music_1",
            sourceEndSeconds: 9,
            sourceStartSeconds: -2,
            timelineStartSeconds: 1.5,
            trackId: "track_1",
            trackTitle: "Track",
            volume: 0.5,
          },
        ],
        outputDuration: 2,
        timelineOffsets: [0.5],
        trimRanges: [{ start: 0.2, end: 1.2 }],
      }),
    ).resolves.toBe(context.renderedBuffer);

    expect(context.OfflineAudioContextMock).toHaveBeenCalledWith(2, 96000, 48000);
    expect(audioTrack.buffers).toHaveBeenCalledWith(1.2, 2.2);
    expect(context.starts).toEqual([
      [0.5, 0, 0.5],
      [1.5, 0, 0.5],
    ]);
    expect(context.gains).toEqual([1, 0.09]);
  });

  it("skips unavailable source tracks and unplayable music ranges", async () => {
    const context = createOfflineAudioContextMock();
    const inputs = [
      {
        getPrimaryAudioTrack: vi.fn(async () => null),
      },
    ];

    vi.stubGlobal("OfflineAudioContext", context.OfflineAudioContextMock);

    await createLongrMixedAudioBuffer({
      inputs: inputs as never,
      musicClips: [
        {
          blob: new Blob(["music"], { type: "audio/mpeg" }),
          durationSeconds: 1,
          id: "music_1",
          sourceEndSeconds: 1,
          sourceStartSeconds: 1,
          timelineStartSeconds: 3,
          trackId: "track_1",
          trackTitle: "Track",
          volume: 2,
        },
      ],
      outputDuration: 2,
      timelineOffsets: [0],
      trimRanges: [{ start: 0, end: 1 }],
    });

    expect(context.starts).toEqual([]);
    expect(context.gains).toEqual([]);
  });
});
