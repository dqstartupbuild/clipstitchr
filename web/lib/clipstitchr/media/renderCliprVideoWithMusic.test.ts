import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderCliprVideoWithMusic } from "@/lib/clipstitchr/media/renderCliprVideoWithMusic";

const mocks = vi.hoisted(() => ({
  audioSourceAdd: vi.fn(),
  audioSourceClose: vi.fn(),
  copyVideoSamplesToSource: vi.fn(),
  createCliprMixedAudioBuffer: vi.fn(),
  createMediaInput: vi.fn(),
  createMp4Output: vi.fn(),
  createVideoBlobFromBuffer: vi.fn(),
  getInputDuration: vi.fn(),
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
    return {
      close: mocks.videoSourceClose,
    };
  }),
}));

vi.mock("@/lib/clipstitchr/media/copyVideoSamplesToSource", () => ({
  copyVideoSamplesToSource: mocks.copyVideoSamplesToSource,
}));

vi.mock("@/lib/clipstitchr/media/createCliprMixedAudioBuffer", () => ({
  createCliprMixedAudioBuffer: mocks.createCliprMixedAudioBuffer,
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

vi.mock("@/lib/clipstitchr/media/getInputDuration", () => ({
  getInputDuration: mocks.getInputDuration,
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

describe("renderCliprVideoWithMusic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createMediaInput.mockReturnValue({
      dispose: vi.fn(),
    });
    mocks.createMp4Output.mockReturnValue({
      addAudioTrack: vi.fn(),
      addVideoTrack: vi.fn(),
      finalize: vi.fn(),
      start: vi.fn(),
      target: {
        buffer: new Uint8Array([1, 2, 3]).buffer,
      },
    });
    mocks.getInputDuration.mockResolvedValue(12);
    mocks.createCliprMixedAudioBuffer.mockResolvedValue({ duration: 12 });
    mocks.getSupportedOutputCodecs.mockResolvedValue({
      audioCodec: "aac",
      videoCodec: "avc",
      warnings: [],
    });
    mocks.copyVideoSamplesToSource.mockImplementation(async ({ onProgress }) => {
      onProgress?.(0.5);
      return { endTimestamp: 12 };
    });
    mocks.getVideoMimeType.mockResolvedValue("video/mp4");
    mocks.createVideoBlobFromBuffer.mockReturnValue(
      new Blob(["rendered"], { type: "video/mp4" }),
    );
  });

  it("renders a Clipr video with mixed music and progress reporting", async () => {
    const onProgress = vi.fn();

    await expect(
      renderCliprVideoWithMusic({
        musicBlob: new Blob(["music"], { type: "audio/mpeg" }),
        onProgress,
        videoBlob: new Blob(["video"], { type: "video/mp4" }),
        volume: 0.75,
      }),
    ).resolves.toEqual({
      blob: expect.any(Blob),
      duration: 12,
      mimeType: "video/mp4",
    });

    expect(mocks.registerAacEncoderIfNeeded).toHaveBeenCalled();
    expect(mocks.createCliprMixedAudioBuffer).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: 12,
        volume: 0.75,
      }),
    );
    expect(mocks.copyVideoSamplesToSource).toHaveBeenCalledWith(
      expect.objectContaining({
        timelineOffset: 0,
        trimRange: { start: 0, end: 12 },
      }),
    );
    expect(mocks.audioSourceAdd).toHaveBeenCalledWith({ duration: 12 });
    expect(mocks.videoSourceClose).toHaveBeenCalled();
    expect(mocks.audioSourceClose).toHaveBeenCalled();
    expect(onProgress).toHaveBeenCalledWith(0.15);
    expect(onProgress).toHaveBeenCalledWith(0.5);
    expect(onProgress).toHaveBeenLastCalledWith(1);
  });

  it("throws codec warnings and still disposes the input", async () => {
    const input = {
      dispose: vi.fn(),
    };

    mocks.createMediaInput.mockReturnValue(input);
    mocks.getSupportedOutputCodecs.mockResolvedValueOnce({
      audioCodec: "aac",
      videoCodec: null,
      warnings: ["No video codec."],
    });

    await expect(
      renderCliprVideoWithMusic({
        musicBlob: new Blob(["music"]),
        videoBlob: new Blob(["video"]),
        volume: 1,
      }),
    ).rejects.toThrow("No video codec.");
    expect(input.dispose).toHaveBeenCalled();

    mocks.getSupportedOutputCodecs.mockResolvedValueOnce({
      audioCodec: null,
      videoCodec: "avc",
      warnings: ["Video ok", "No audio codec."],
    });

    await expect(
      renderCliprVideoWithMusic({
        musicBlob: new Blob(["music"]),
        videoBlob: new Blob(["video"]),
        volume: 1,
      }),
    ).rejects.toThrow("No audio codec.");
  });
});
