import { beforeEach, describe, expect, it, vi } from "vitest";
import { stitchNormalizedVideosWithTextOverlay } from "@/lib/clipstitchr/media/stitchNormalizedVideosWithTextOverlay";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

const mocks = vi.hoisted(() => ({
  audioSourceClose: vi.fn(),
  copyAudioSamplesToSource: vi.fn(),
  copyTextOverlayVideoFramesToSource: vi.fn(),
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
    return { close: mocks.videoSourceClose };
  }),
}));

vi.mock("@/lib/clipstitchr/media/copyAudioSamplesToSource", () => ({
  copyAudioSamplesToSource: mocks.copyAudioSamplesToSource,
}));

vi.mock(
  "@/lib/clipstitchr/media/copyTextOverlayVideoFramesToSource",
  () => ({
    copyTextOverlayVideoFramesToSource:
      mocks.copyTextOverlayVideoFramesToSource,
  }),
);

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

function createOverlay(): TextOverlay {
  return {
    endTime: 8,
    fontSize: 0.08,
    startTime: 0,
    styleId: "hook",
    text: "Launch faster",
    width: 0.8,
    x: 0.1,
    y: 0.1,
  };
}

describe("stitchNormalizedVideosWithTextOverlay", () => {
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
    mocks.createTextOverlayRenderContext.mockReturnValue({
      canvas: {},
      context: {},
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
    mocks.copyTextOverlayVideoFramesToSource
      .mockResolvedValueOnce({ endTimestamp: 3 })
      .mockResolvedValueOnce({ endTimestamp: 8 });
    mocks.copyAudioSamplesToSource.mockResolvedValue({ endTimestamp: 8 });
    mocks.getVideoMimeType.mockResolvedValue("video/mp4");
    mocks.createVideoBlobFromBuffer.mockReturnValue(
      new Blob(["stitch"], { type: "video/mp4" }),
    );
  });

  it("stitches UGC then demo clips through a shared text overlay render context", async () => {
    const overlay = createOverlay();

    await expect(
      stitchNormalizedVideosWithTextOverlay(
        createClip("ugc", 6),
        createClip("demo", 5),
        {
          demoTrimRange: { start: 0, end: 5 },
          textOverlay: overlay,
          ugcTrimRange: { start: 1, end: 4 },
        },
      ),
    ).resolves.toEqual({
      blob: expect.any(Blob),
      duration: 8,
      mimeType: "video/mp4",
    });
    expect(mocks.createTextOverlayRenderContext).toHaveBeenCalledWith(
      1080,
      1920,
    );
    expect(mocks.copyTextOverlayVideoFramesToSource).toHaveBeenCalledTimes(2);
    expect(mocks.copyTextOverlayVideoFramesToSource).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        textOverlay: overlay,
        timelineOffset: 0,
      }),
    );
    expect(mocks.copyAudioSamplesToSource).toHaveBeenCalledTimes(2);
  });

  it("rejects missing audio encoders when audio is included", async () => {
    mocks.getSupportedOutputCodecs.mockResolvedValueOnce({
      audioCodec: null,
      videoCodec: "avc",
      warnings: ["video warning", "audio warning"],
    });

    await expect(
      stitchNormalizedVideosWithTextOverlay(
        createClip("ugc", 6),
        createClip("demo", 5),
        {
          demoTrimRange: { start: 0, end: 5 },
          textOverlay: createOverlay(),
          ugcTrimRange: { start: 1, end: 4 },
        },
      ),
    ).rejects.toThrow("audio warning");
  });
});
