import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Input, VideoSampleSource } from "mediabunny";
import { copyVideoSamplesToSource } from "@/lib/clipstitchr/media/copyVideoSamplesToSource";

const mocks = vi.hoisted(() => ({
  samples: [] as MockVideoSample[],
}));

type MockVideoSample = {
  close: ReturnType<typeof vi.fn>;
  duration: number;
  setDuration: ReturnType<typeof vi.fn>;
  setRotation: ReturnType<typeof vi.fn>;
  setTimestamp: ReturnType<typeof vi.fn>;
  timestamp: number;
};

vi.mock("mediabunny", () => ({
  VideoSampleSink: vi.fn(function VideoSampleSink() {
    return {
      samples: async function* samples() {
        yield* mocks.samples;
      },
    };
  }),
}));

function createSample(timestamp: number, duration: number): MockVideoSample {
  const sample: MockVideoSample = {
    close: vi.fn(),
    duration,
    setDuration: vi.fn((nextDuration: number) => {
      sample.duration = nextDuration;
    }),
    setRotation: vi.fn(),
    setTimestamp: vi.fn((nextTimestamp: number) => {
      sample.timestamp = nextTimestamp;
    }),
    timestamp,
  };

  return sample;
}

function createInput(track: object | null): Input {
  return {
    getPrimaryVideoTrack: vi.fn().mockResolvedValue(track),
  } as unknown as Input;
}

describe("copyVideoSamplesToSource", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.samples = [];
  });

  it("retimes, trims, and copies video samples into a source", async () => {
    const track = {
      computeDuration: vi.fn().mockResolvedValue(20),
      getFirstTimestamp: vi.fn().mockResolvedValue(10),
    };
    const firstSample = createSample(12, 3);
    const secondSample = createSample(17, 5);
    const progress = vi.fn();
    const source = {
      add: vi.fn().mockResolvedValue(undefined),
    } as unknown as VideoSampleSource;

    mocks.samples = [firstSample, secondSample];

    await expect(
      copyVideoSamplesToSource({
        input: createInput(track),
        onProgress: progress,
        source,
        timelineOffset: 5,
        trimRange: { start: 2, end: 8 },
      }),
    ).resolves.toEqual({ endTimestamp: 11 });

    expect(firstSample.setTimestamp).toHaveBeenCalledWith(5);
    expect(firstSample.setRotation).toHaveBeenCalledWith(0);
    expect(source.add).toHaveBeenNthCalledWith(1, firstSample, {
      keyFrame: true,
    });
    expect(secondSample.setTimestamp).toHaveBeenCalledWith(10);
    expect(secondSample.setDuration).toHaveBeenCalledWith(1);
    expect(source.add).toHaveBeenNthCalledWith(2, secondSample, undefined);
    expect(firstSample.close).toHaveBeenCalled();
    expect(secondSample.close).toHaveBeenCalled();
    expect(progress).toHaveBeenLastCalledWith(1);
  });

  it("compresses video sample timestamps and durations for 2x playback", async () => {
    const track = {
      computeDuration: vi.fn().mockResolvedValue(20),
      getFirstTimestamp: vi.fn().mockResolvedValue(10),
    };
    const firstSample = createSample(12, 2);
    const secondSample = createSample(16, 4);
    const source = {
      add: vi.fn().mockResolvedValue(undefined),
    } as unknown as VideoSampleSource;

    mocks.samples = [firstSample, secondSample];

    await expect(
      copyVideoSamplesToSource({
        input: createInput(track),
        playbackRate: 2,
        source,
        timelineOffset: 5,
        trimRange: { start: 2, end: 8 },
      }),
    ).resolves.toEqual({ endTimestamp: 8 });

    expect(firstSample.setTimestamp).toHaveBeenCalledWith(5);
    expect(firstSample.setDuration).toHaveBeenCalledWith(1);
    expect(secondSample.setTimestamp).toHaveBeenCalledWith(7);
    expect(secondSample.setDuration).toHaveBeenCalledWith(1);
  });

  it("throws when the input has no video track", async () => {
    await expect(
      copyVideoSamplesToSource({
        input: createInput(null),
        source: { add: vi.fn() } as unknown as VideoSampleSource,
        timelineOffset: 0,
        trimRange: { start: 0, end: 1 },
      }),
    ).rejects.toThrow("A normalized clip was missing its video track.");
  });
});
