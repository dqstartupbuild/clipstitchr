import { beforeEach, describe, expect, it, vi } from "vitest";
import { stitchLongrSequence } from "@/lib/clipstitchr/media/stitchLongrSequence";
import type { LongrSequenceClip } from "@/lib/clipstitchr/types/LongrSequenceClip";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

const mocks = vi.hoisted(() => ({
  audioSourceAdd: vi.fn(),
  audioSourceClose: vi.fn(),
  copyVideoSamplesToSource: vi.fn(),
  createLongrMixedAudioBuffer: vi.fn(),
  createMediaInput: vi.fn(),
  createMp4Output: vi.fn(),
  createVideoBlobFromBuffer: vi.fn(),
  getSupportedOutputCodecs: vi.fn(),
  getVideoMimeType: vi.fn(),
  registerAacEncoderIfNeeded: vi.fn(),
  videoSourceClose: vi.fn(),
}));

vi.mock("mediabunny", () => ({
  AudioBufferSource: vi.fn(function AudioBufferSource() {
    return {
      add: mocks.audioSourceAdd,
      close: mocks.audioSourceClose,
    };
  }),
  VideoSampleSource: vi.fn(function VideoSampleSource() {
    return { close: mocks.videoSourceClose };
  }),
}));

vi.mock("@/lib/clipstitchr/media/copyVideoSamplesToSource", () => ({
  copyVideoSamplesToSource: mocks.copyVideoSamplesToSource,
}));

vi.mock("@/lib/clipstitchr/media/createLongrMixedAudioBuffer", () => ({
  createLongrMixedAudioBuffer: mocks.createLongrMixedAudioBuffer,
}));

vi.mock("@/lib/clipstitchr/media/createMediaInput", () => ({
  createMediaInput: mocks.createMediaInput,
}));

vi.mock("@/lib/clipstitchr/media/createMp4Output", () => ({
  createMp4Output: mocks.createMp4Output,
}));

vi.mock("@/lib/clipstitchr/media/createVideoBlobFromBuffer", () => ({
  createVideoBlobFromBuffer: mocks.createVideoBlobFromBuffer,
}));

vi.mock("@/lib/clipstitchr/media/getSupportedOutputCodecs", () => ({
  getSupportedOutputCodecs: mocks.getSupportedOutputCodecs,
}));

vi.mock("@/lib/clipstitchr/media/getVideoMimeType", () => ({
  getVideoMimeType: mocks.getVideoMimeType,
}));

vi.mock("@/lib/clipstitchr/media/registerAacEncoderIfNeeded", () => ({
  registerAacEncoderIfNeeded: mocks.registerAacEncoderIfNeeded,
}));

function createClip(id: string, duration: number): VideoClip {
  return {
    aspectRatio: 9 / 16,
    blob: new Blob([id], { type: "video/mp4" }),
    clipType: "ugc",
    createdAt: "2026-01-01T00:00:00.000Z",
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
    updatedAt: "2026-01-01T00:00:00.000Z",
    videoObject: {
      contentType: "video/mp4",
      key: `users/user_1/video-clips/${id}/video.mp4`,
      size: 100,
    },
    width: 1080,
  };
}

function createSequenceClip(id: string, duration: number): LongrSequenceClip {
  return {
    clip: createClip(id, duration),
    trimRange: { start: 0, end: duration },
  };
}

describe("stitchLongrSequence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createMediaInput.mockImplementation(() => ({
      dispose: vi.fn(),
      getPrimaryAudioTrack: vi.fn().mockResolvedValue({}),
    }));
    mocks.createMp4Output.mockReturnValue({
      addAudioTrack: vi.fn(),
      addVideoTrack: vi.fn(),
      finalize: vi.fn(),
      start: vi.fn(),
      target: {
        buffer: new Uint8Array([1, 2, 3]).buffer,
      },
    });
    mocks.getSupportedOutputCodecs.mockResolvedValue({
      audioCodec: "aac",
      videoCodec: "avc",
      warnings: [],
    });
    mocks.copyVideoSamplesToSource
      .mockResolvedValueOnce({ endTimestamp: 4 })
      .mockResolvedValueOnce({ endTimestamp: 9 });
    mocks.createLongrMixedAudioBuffer.mockResolvedValue({ duration: 9 });
    mocks.getVideoMimeType.mockResolvedValue("video/mp4");
    mocks.createVideoBlobFromBuffer.mockReturnValue(
      new Blob(["longr"], { type: "video/mp4" }),
    );
  });

  it("stitches a Longr sequence and mixes audio", async () => {
    const progress = vi.fn();

    await expect(
      stitchLongrSequence(
        [createSequenceClip("clip_1", 4), createSequenceClip("clip_2", 5)],
        { onProgress: progress },
      ),
    ).resolves.toEqual({
      blob: expect.any(Blob),
      duration: 9,
      mimeType: "video/mp4",
    });
    expect(mocks.copyVideoSamplesToSource).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        timelineOffset: 4,
      }),
    );
    expect(mocks.createLongrMixedAudioBuffer).toHaveBeenCalledWith(
      expect.objectContaining({
        outputDuration: 9,
        timelineOffsets: [0, 4],
      }),
    );
    expect(mocks.audioSourceAdd).toHaveBeenCalledWith({ duration: 9 });
    expect(mocks.videoSourceClose).toHaveBeenCalled();
    expect(mocks.audioSourceClose).toHaveBeenCalled();
    expect(progress).toHaveBeenLastCalledWith(1);
  });

  it("rejects empty sequences and missing codecs", async () => {
    await expect(stitchLongrSequence([])).rejects.toThrow(
      "Select at least one clip before building a Long.",
    );

    mocks.getSupportedOutputCodecs.mockResolvedValueOnce({
      audioCodec: null,
      videoCodec: null,
      warnings: ["No video codec."],
    });

    await expect(stitchLongrSequence([createSequenceClip("clip_1", 4)])).rejects
      .toThrow("No video codec.");
  });
});
