import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultDeadSpaceAnalysisOptions } from "@/lib/clipstitchr/tools/deadSpaceFinder/defaultDeadSpaceAnalysisOptions";
import { readDeadSpaceAnalysis } from "@/lib/clipstitchr/tools/deadSpaceFinder/readDeadSpaceAnalysis";

const mocks = vi.hoisted(() => ({
  audioSamples: [] as Array<{ close: ReturnType<typeof vi.fn> }>,
  calculateAudioSampleRms: vi.fn(() => 0.01),
  calculateFrameLumaDifference: vi.fn(),
  dispose: vi.fn(),
  getCanvasPixelData: vi.fn(() => new Uint8ClampedArray([0, 0, 0, 255])),
  input: null as unknown,
}));

vi.mock("@/lib/clipstitchr/media/createMediaInput", () => ({
  createMediaInput: vi.fn(() => mocks.input),
}));

vi.mock("@/lib/clipstitchr/tools/deadSpaceFinder/getCanvasPixelData", () => ({
  getCanvasPixelData: mocks.getCanvasPixelData,
}));

vi.mock(
  "@/lib/clipstitchr/tools/deadSpaceFinder/calculateFrameLumaDifference",
  () => ({
    calculateFrameLumaDifference: mocks.calculateFrameLumaDifference,
  }),
);

vi.mock(
  "@/lib/clipstitchr/tools/deadSpaceFinder/calculateAudioSampleRms",
  () => ({
    calculateAudioSampleRms: mocks.calculateAudioSampleRms,
  }),
);

vi.mock("mediabunny", () => ({
  CanvasSink: class {
    async *canvasesAtTimestamps(timestamps: number[]) {
      for (const timestamp of timestamps)
        yield { canvas: {}, timestamp, duration: 0.5 };
    }
  },
  AudioSampleSink: class {
    async *samplesAtTimestamps(timestamps: number[]) {
      for (let index = 0; index < timestamps.length; index += 1) {
        const sample = { close: vi.fn() };
        mocks.audioSamples.push(sample);
        yield sample;
      }
    }
  },
}));

describe("readDeadSpaceAnalysis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.audioSamples = [];
    mocks.calculateFrameLumaDifference
      .mockReturnValueOnce(0.01)
      .mockReturnValueOnce(0.01)
      .mockReturnValueOnce(0.2);
    const videoTrack = {
      canDecode: vi.fn().mockResolvedValue(true),
      computeDuration: vi.fn().mockResolvedValue(2),
    };
    const audioTrack = { canDecode: vi.fn().mockResolvedValue(true) };
    mocks.input = {
      dispose: mocks.dispose,
      getPrimaryAudioTrack: vi.fn().mockResolvedValue(audioTrack),
      getPrimaryVideoTrack: vi.fn().mockResolvedValue(videoTrack),
    };
  });

  it("samples local video and audio, closes every audio sample, and disposes input", async () => {
    const result = await readDeadSpaceAnalysis(new File(["video"], "ad.mp4"), {
      ...defaultDeadSpaceAnalysisOptions,
      minimumSpanSeconds: 1,
    });

    expect(result.sampleCount).toBe(4);
    expect(result.spans).toHaveLength(1);
    expect(result.spans[0]).toMatchObject({ start: 0.5, end: 1.5 });
    expect(mocks.audioSamples).toHaveLength(4);
    expect(
      mocks.audioSamples.every(
        (sample) => sample.close.mock.calls.length === 1,
      ),
    ).toBe(true);
    expect(mocks.dispose).toHaveBeenCalledTimes(1);
  });

  it("rejects oversized files before allocating a Media Bunny input", async () => {
    const oversized = { name: "large.mp4", size: 201 * 1024 * 1024 } as File;

    await expect(
      readDeadSpaceAnalysis(oversized, defaultDeadSpaceAnalysisOptions),
    ).rejects.toThrow("smaller than 200 MB");
  });
});
