import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AudioSampleSource, Input } from "mediabunny";
import { copyAudioSamplesToSource } from "@/lib/clipstitchr/media/copyAudioSamplesToSource";

const mocks = vi.hoisted(() => ({
  samples: [] as MockAudioSample[],
}));

type MockAudioSample = {
  close: ReturnType<typeof vi.fn>;
  duration: number;
  setTimestamp: ReturnType<typeof vi.fn>;
  timestamp: number;
};

vi.mock("mediabunny", () => ({
  AudioSampleSink: vi.fn(function AudioSampleSink() {
    return {
      samples: async function* samples() {
        yield* mocks.samples;
      },
    };
  }),
}));

function createSample(timestamp: number, duration: number): MockAudioSample {
  const sample: MockAudioSample = {
    close: vi.fn(),
    duration,
    setTimestamp: vi.fn((nextTimestamp: number) => {
      sample.timestamp = nextTimestamp;
    }),
    timestamp,
  };

  return sample;
}

function createInput(track: object | null): Input {
  return {
    getPrimaryAudioTrack: vi.fn().mockResolvedValue(track),
  } as unknown as Input;
}

describe("copyAudioSamplesToSource", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.samples = [];
  });

  it("retimes and copies audio samples into a source", async () => {
    const track = {
      computeDuration: vi.fn().mockResolvedValue(20),
      getFirstTimestamp: vi.fn().mockResolvedValue(10),
    };
    const firstSample = createSample(12, 3);
    const secondSample = createSample(18, 5);
    const progress = vi.fn();
    const source = {
      add: vi.fn().mockResolvedValue(undefined),
    } as unknown as AudioSampleSource;

    mocks.samples = [firstSample, secondSample];

    await expect(
      copyAudioSamplesToSource({
        input: createInput(track),
        onProgress: progress,
        source,
        timelineOffset: 5,
        trimRange: { start: 2, end: 8 },
      }),
    ).resolves.toEqual({ endTimestamp: 8 });

    expect(firstSample.setTimestamp).toHaveBeenCalledWith(5);
    expect(source.add).toHaveBeenCalledTimes(1);
    expect(source.add).toHaveBeenCalledWith(firstSample);
    expect(firstSample.close).toHaveBeenCalled();
    expect(secondSample.close).toHaveBeenCalled();
    expect(progress).toHaveBeenLastCalledWith(1);
  });

  it("returns the timeline offset when the input has no audio track", async () => {
    await expect(
      copyAudioSamplesToSource({
        input: createInput(null),
        source: { add: vi.fn() } as unknown as AudioSampleSource,
        timelineOffset: 9,
        trimRange: { start: 0, end: 1 },
      }),
    ).resolves.toEqual({ endTimestamp: 9 });
  });
});
