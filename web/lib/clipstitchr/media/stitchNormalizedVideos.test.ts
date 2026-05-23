import { beforeEach, describe, expect, it, vi } from "vitest";
import { stitchNormalizedVideos } from "@/lib/clipstitchr/media/stitchNormalizedVideos";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

const mocks = vi.hoisted(() => ({
  audioBufferSourceAdd: vi.fn(),
  audioBufferSourceClose: vi.fn(),
  audioSourceClose: vi.fn(),
  copyAudioSamplesToSource: vi.fn(),
  copyVideoSamplesToSource: vi.fn(),
  createMediaInput: vi.fn(),
  createMp4Output: vi.fn(),
  createStitchSourceAudioBuffer: vi.fn(),
  createVideoBlobFromBuffer: vi.fn(),
  getInputAudioParameters: vi.fn(),
  getSupportedOutputCodecs: vi.fn(),
  getVideoMimeType: vi.fn(),
  registerAacEncoderIfNeeded: vi.fn(),
  videoSourceClose: vi.fn(),
}));

vi.mock("mediabunny", () => ({
  AudioBufferSource: vi.fn(function AudioBufferSource() {
    return {
      add: mocks.audioBufferSourceAdd,
      close: mocks.audioBufferSourceClose,
    };
  }),
  AudioSampleSource: vi.fn(function AudioSampleSource() {
    return { close: mocks.audioSourceClose };
  }),
  VideoSampleSource: vi.fn(function VideoSampleSource() {
    return { close: mocks.videoSourceClose };
  }),
}));

vi.mock("@/lib/clipstitchr/media/copyAudioSamplesToSource", () => ({
  copyAudioSamplesToSource: mocks.copyAudioSamplesToSource,
}));

vi.mock("@/lib/clipstitchr/media/copyVideoSamplesToSource", () => ({
  copyVideoSamplesToSource: mocks.copyVideoSamplesToSource,
}));

vi.mock("@/lib/clipstitchr/media/createMediaInput", () => ({
  createMediaInput: mocks.createMediaInput,
}));

vi.mock("@/lib/clipstitchr/media/createMp4Output", () => ({
  createMp4Output: mocks.createMp4Output,
}));

vi.mock("@/lib/clipstitchr/media/createStitchSourceAudioBuffer", () => ({
  createStitchSourceAudioBuffer: mocks.createStitchSourceAudioBuffer,
}));

vi.mock("@/lib/clipstitchr/media/createVideoBlobFromBuffer", () => ({
  createVideoBlobFromBuffer: mocks.createVideoBlobFromBuffer,
}));

vi.mock("@/lib/clipstitchr/media/getInputAudioParameters", () => ({
  getInputAudioParameters: mocks.getInputAudioParameters,
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

describe("stitchNormalizedVideos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createMediaInput.mockReturnValue({ dispose: vi.fn() });
    mocks.createMp4Output.mockReturnValue({
      addAudioTrack: vi.fn(),
      addVideoTrack: vi.fn(),
      finalize: vi.fn(),
      start: vi.fn(),
      target: {
        buffer: new Uint8Array([1, 2, 3]).buffer,
      },
    });
    mocks.getInputAudioParameters.mockResolvedValue({
      numberOfChannels: 2,
      sampleRate: 48000,
    });
    mocks.getSupportedOutputCodecs.mockResolvedValue({
      audioCodec: "aac",
      videoCodec: "avc",
      warnings: [],
    });
    mocks.copyVideoSamplesToSource
      .mockResolvedValueOnce({ endTimestamp: 3 })
      .mockResolvedValueOnce({ endTimestamp: 8 });
    mocks.copyAudioSamplesToSource.mockResolvedValue({ endTimestamp: 8 });
    mocks.createStitchSourceAudioBuffer.mockResolvedValue({ duration: 6.5 });
    mocks.getVideoMimeType.mockResolvedValue("video/mp4");
    mocks.createVideoBlobFromBuffer.mockReturnValue(
      new Blob(["stitch"], { type: "video/mp4" }),
    );
  });

  it("stitches UGC then demo clips with source audio", async () => {
    const progress = vi.fn();

    await expect(
      stitchNormalizedVideos(createClip("ugc", 6), createClip("demo", 5), {
        demoTrimRange: { start: 0, end: 5 },
        onProgress: progress,
        ugcTrimRange: { start: 1, end: 4 },
      }),
    ).resolves.toEqual({
      blob: expect.any(Blob),
      duration: 8,
      mimeType: "video/mp4",
    });
    expect(mocks.registerAacEncoderIfNeeded).toHaveBeenCalled();
    expect(mocks.copyVideoSamplesToSource).toHaveBeenCalledTimes(2);
    expect(mocks.copyVideoSamplesToSource).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        timelineOffset: 3,
      }),
    );
    expect(mocks.copyAudioSamplesToSource).toHaveBeenCalledTimes(2);
    expect(mocks.videoSourceClose).toHaveBeenCalled();
    expect(mocks.audioSourceClose).toHaveBeenCalled();
    expect(progress).toHaveBeenLastCalledWith(1);
  });

  it("skips disabled source audio", async () => {
    mocks.getInputAudioParameters.mockClear();
    mocks.copyVideoSamplesToSource
      .mockReset()
      .mockResolvedValueOnce({ endTimestamp: 3 })
      .mockResolvedValueOnce({ endTimestamp: 8 });

    await stitchNormalizedVideos(createClip("ugc", 6), createClip("demo", 5), {
      demoTrimRange: { start: 0, end: 5 },
      includeDemoAudio: false,
      includeUgcAudio: false,
      ugcTrimRange: { start: 1, end: 4 },
    });

    expect(mocks.getSupportedOutputCodecs).toHaveBeenCalledWith(false);
    expect(mocks.copyAudioSamplesToSource).not.toHaveBeenCalled();
  });

  it("uses an audio buffer source when source clips are sped up", async () => {
    mocks.copyVideoSamplesToSource
      .mockReset()
      .mockResolvedValueOnce({ endTimestamp: 1.5 })
      .mockResolvedValueOnce({ endTimestamp: 6.5 });

    await expect(
      stitchNormalizedVideos(createClip("ugc", 6), createClip("demo", 5), {
        demoTrimRange: { start: 0, end: 5 },
        ugcPlaybackRate: 2,
        ugcTrimRange: { start: 1, end: 4 },
      }),
    ).resolves.toEqual({
      blob: expect.any(Blob),
      duration: 6.5,
      mimeType: "video/mp4",
    });

    expect(mocks.copyVideoSamplesToSource).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        playbackRate: 2,
        timelineOffset: 0,
      }),
    );
    expect(mocks.copyVideoSamplesToSource).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        playbackRate: 1,
        timelineOffset: 1.5,
      }),
    );
    expect(mocks.createStitchSourceAudioBuffer).toHaveBeenCalledWith(
      expect.objectContaining({
        outputDuration: 6.5,
        ugcPlaybackRate: 2,
      }),
    );
    expect(mocks.audioBufferSourceAdd).toHaveBeenCalledWith({ duration: 6.5 });
    expect(mocks.copyAudioSamplesToSource).not.toHaveBeenCalled();
  });

  it("rejects unsupported audio parameters", async () => {
    mocks.getInputAudioParameters.mockResolvedValueOnce({
      numberOfChannels: 1,
      sampleRate: 44100,
    });

    await expect(
      stitchNormalizedVideos(createClip("ugc", 6), createClip("demo", 5), {
        demoTrimRange: { start: 0, end: 5 },
        ugcTrimRange: { start: 1, end: 4 },
      }),
    ).rejects.toThrow("audio at 1 channels and 44100 Hz");
  });
});
