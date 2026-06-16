import { beforeEach, describe, expect, it, vi } from "vitest";
import { createVideoSegmentBlob } from "@/lib/clipstitchr/media/createVideoSegmentBlob";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

const mocks = vi.hoisted(() => ({
  audioSourceClose: vi.fn(),
  canvasSourceClose: vi.fn(),
  copyAudioSamplesToSource: vi.fn(),
  copyTextOverlayVideoFramesToSource: vi.fn(),
  copyVideoSamplesToSource: vi.fn(),
  createMediaInput: vi.fn(),
  createMp4Output: vi.fn(),
  createTextOverlayRenderContext: vi.fn(),
  createVideoBlobFromBuffer: vi.fn(),
  getInputAudioParameters: vi.fn(),
  getSupportedOutputCodecs: vi.fn(),
  getVideoMimeType: vi.fn(),
  registerAacEncoderIfNeeded: vi.fn(),
  videoSourceClose: vi.fn(),
}));

vi.mock("mediabunny", () => ({
  AudioSampleSource: vi.fn(function AudioSampleSource() {
    return { close: mocks.audioSourceClose };
  }),
  CanvasSource: vi.fn(function CanvasSource() {
    return { close: mocks.canvasSourceClose };
  }),
  VideoSampleSource: vi.fn(function VideoSampleSource() {
    return { close: mocks.videoSourceClose };
  }),
}));

vi.mock("@/lib/clipstitchr/media/copyAudioSamplesToSource", () => ({
  copyAudioSamplesToSource: mocks.copyAudioSamplesToSource,
}));

vi.mock("@/lib/clipstitchr/media/copyTextOverlayVideoFramesToSource", () => ({
  copyTextOverlayVideoFramesToSource: mocks.copyTextOverlayVideoFramesToSource,
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

vi.mock("@/lib/clipstitchr/media/createTextOverlayRenderContext", () => ({
  createTextOverlayRenderContext: mocks.createTextOverlayRenderContext,
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

function createClip(): VideoClip {
  return {
    aspectRatio: 9 / 16,
    blob: new Blob(["clip"], { type: "video/mp4" }),
    clipType: "ugc",
    createdAt: "2026-01-01T00:00:00.000Z",
    duration: 10,
    hasAudio: true,
    height: 1920,
    id: "clip_1",
    mimeType: "video/mp4",
    name: "UGC clip",
    originalName: "clip.mp4",
    originalSize: 100,
    size: 100,
    sourceMimeType: "video/mp4",
    updatedAt: "2026-01-01T00:00:00.000Z",
    videoObject: {
      contentType: "video/mp4",
      key: "users/user_1/video-clips/clip_1/video.mp4",
      size: 100,
    },
    width: 1080,
  };
}

describe("createVideoSegmentBlob", () => {
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
    mocks.copyVideoSamplesToSource.mockResolvedValue({ endTimestamp: 4 });
    mocks.copyTextOverlayVideoFramesToSource.mockResolvedValue({
      endTimestamp: 4,
    });
    mocks.copyAudioSamplesToSource.mockResolvedValue({ endTimestamp: 5 });
    mocks.createTextOverlayRenderContext.mockReturnValue({
      canvas: {},
      context: {},
    });
    mocks.getVideoMimeType.mockResolvedValue("video/mp4");
    mocks.createVideoBlobFromBuffer.mockReturnValue(
      new Blob(["encoded"], { type: "video/mp4" }),
    );
  });

  it("encodes a trimmed segment with audio", async () => {
    const progress = vi.fn();

    await expect(
      createVideoSegmentBlob(createClip(), {
        onProgress: progress,
        trimRange: { start: 2, end: 8 },
      }),
    ).resolves.toEqual({
      blob: expect.any(Blob),
      duration: 6,
      mimeType: "video/mp4",
    });
    expect(mocks.registerAacEncoderIfNeeded).toHaveBeenCalled();
    expect(mocks.getSupportedOutputCodecs).toHaveBeenCalledWith(true);
    expect(mocks.copyVideoSamplesToSource).toHaveBeenCalledWith(
      expect.objectContaining({
        timelineOffset: 0,
        trimRange: { start: 2, end: 8 },
      }),
    );
    expect(mocks.copyAudioSamplesToSource).toHaveBeenCalled();
    expect(mocks.videoSourceClose).toHaveBeenCalled();
    expect(mocks.audioSourceClose).toHaveBeenCalled();
    expect(progress).toHaveBeenLastCalledWith(1);
  });

  it("encodes without audio when no audio track is available", async () => {
    mocks.getInputAudioParameters.mockResolvedValue(null);

    await createVideoSegmentBlob(createClip(), {
      trimRange: { start: 0, end: 3 },
    });

    expect(mocks.registerAacEncoderIfNeeded).not.toHaveBeenCalled();
    expect(mocks.getSupportedOutputCodecs).toHaveBeenCalledWith(false);
    expect(mocks.copyAudioSamplesToSource).not.toHaveBeenCalled();
  });

  it("renders cropped segments through a canvas source", async () => {
    const crop = {
      mode: "smart-9x16" as const,
      positionX: 0.25,
      scale: 1.8,
    };

    await createVideoSegmentBlob(createClip(), {
      quickEdit: {
        crop,
        removeRanges: [],
      },
      trimRange: { start: 0, end: 3 },
    });

    expect(mocks.copyVideoSamplesToSource).not.toHaveBeenCalled();
    expect(mocks.copyTextOverlayVideoFramesToSource).toHaveBeenCalledWith(
      expect.objectContaining({
        crop,
        timelineOffset: 0,
        trimRange: { start: 0, end: 3 },
      }),
    );
    expect(mocks.canvasSourceClose).toHaveBeenCalled();
  });

  it("rejects unsupported source audio and missing codecs", async () => {
    mocks.getInputAudioParameters.mockResolvedValueOnce({
      numberOfChannels: 1,
      sampleRate: 44100,
    });

    await expect(
      createVideoSegmentBlob(createClip(), {
        trimRange: { start: 0, end: 3 },
      }),
    ).rejects.toThrow("audio at 1 channels and 44100 Hz");

    mocks.getInputAudioParameters.mockResolvedValueOnce(null);
    mocks.getSupportedOutputCodecs.mockResolvedValueOnce({
      audioCodec: null,
      videoCodec: null,
      warnings: ["No video codec."],
    });

    await expect(
      createVideoSegmentBlob(createClip(), {
        trimRange: { start: 0, end: 3 },
      }),
    ).rejects.toThrow("No video codec.");
  });
});
