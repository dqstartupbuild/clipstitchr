import { beforeEach, describe, expect, it, vi } from "vitest";
import { normalizeUploadedVideo } from "@/lib/clipstitchr/media/normalizeUploadedVideo";

const mocks = vi.hoisted(() => ({
  conversionExecute: vi.fn(),
  conversionInit: vi.fn(),
  createMediaInput: vi.fn(),
  createMp4Output: vi.fn(),
  createVideoBlobFromBuffer: vi.fn(),
  getClipMetadata: vi.fn(),
  getSupportedOutputCodecs: vi.fn(),
  getVideoMimeType: vi.fn(),
  registerAacEncoderIfNeeded: vi.fn(),
}));

vi.mock("mediabunny", () => ({
  Conversion: {
    init: mocks.conversionInit,
  },
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

vi.mock("@/lib/clipstitchr/media/getClipMetadata", () => ({
  getClipMetadata: mocks.getClipMetadata,
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

function createMetadata(overrides: Record<string, unknown> = {}) {
  return {
    aspectRatio: 1,
    audioCanDecode: true,
    duration: 5,
    hasAudio: true,
    height: 720,
    mimeType: "video/quicktime",
    videoCanDecode: true,
    width: 720,
    ...overrides,
  };
}

describe("normalizeUploadedVideo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createMediaInput
      .mockReturnValueOnce({ dispose: vi.fn(), kind: "source" })
      .mockReturnValueOnce({ dispose: vi.fn(), kind: "normalized" });
    mocks.createMp4Output.mockReturnValue({
      target: {
        buffer: new Uint8Array([1, 2, 3]).buffer,
      },
    });
    mocks.getClipMetadata
      .mockResolvedValueOnce(createMetadata())
      .mockResolvedValueOnce(createMetadata({ mimeType: "video/mp4" }));
    mocks.getSupportedOutputCodecs.mockResolvedValue({
      audioCodec: "aac",
      videoCodec: "avc",
      warnings: [],
    });
    mocks.conversionInit.mockImplementation(async () => ({
      execute: mocks.conversionExecute,
      isValid: true,
      onProgress: undefined,
    }));
    mocks.conversionExecute.mockImplementation(async function execute(
      this: { onProgress?: (progress: number) => void },
    ) {
      this.onProgress?.(0.5);
    });
    mocks.getVideoMimeType.mockResolvedValue("video/mp4");
    mocks.createVideoBlobFromBuffer.mockReturnValue(
      new Blob(["normalized"], { type: "video/mp4" }),
    );
  });

  it("normalizes uploaded videos into a 9:16 MP4 with audio settings", async () => {
    const onProgress = vi.fn();

    await expect(
      normalizeUploadedVideo(
        new File(["video"], "source.mov", { type: "video/quicktime" }),
        onProgress,
        { fit: "cover" },
      ),
    ).resolves.toEqual({
      blob: expect.any(Blob),
      metadata: expect.objectContaining({
        aspectRatio: 1080 / 1920,
        height: 1920,
        mimeType: "video/mp4",
        width: 1080,
      }),
      mimeType: "video/mp4",
    });

    expect(mocks.registerAacEncoderIfNeeded).toHaveBeenCalled();
    expect(mocks.getSupportedOutputCodecs).toHaveBeenCalledWith(true);
    expect(mocks.conversionInit).toHaveBeenCalledWith(
      expect.objectContaining({
        audio: expect.objectContaining({
          codec: "aac",
          numberOfChannels: 2,
          sampleRate: 48000,
        }),
        video: expect.objectContaining({
          codec: "avc",
          fit: "cover",
          height: 1920,
          width: 1080,
        }),
      }),
    );
    expect(onProgress).toHaveBeenCalledWith(0.5);
  });

  it("discards audio for silent uploads and rejects unsupported inputs", async () => {
    mocks.createMediaInput.mockReset();
    mocks.getClipMetadata.mockReset();
    mocks.createMediaInput
      .mockReturnValueOnce({ dispose: vi.fn(), kind: "silent" })
      .mockReturnValueOnce({ dispose: vi.fn(), kind: "normalized" });
    mocks.getClipMetadata
      .mockResolvedValueOnce(createMetadata({ hasAudio: false }))
      .mockResolvedValueOnce(createMetadata({ hasAudio: false }));

    await normalizeUploadedVideo(
      new File(["video"], "silent.mp4", { type: "video/mp4" }),
    );
    expect(mocks.getSupportedOutputCodecs).toHaveBeenCalledWith(false);
    expect(mocks.conversionInit).toHaveBeenCalledWith(
      expect.objectContaining({
        audio: { discard: true },
      }),
    );

    mocks.createMediaInput.mockReturnValueOnce({ dispose: vi.fn() });
    mocks.getClipMetadata.mockResolvedValueOnce(
      createMetadata({ videoCanDecode: false }),
    );

    await expect(
      normalizeUploadedVideo(new File(["video"], "bad.mp4")),
    ).rejects.toThrow("cannot decode the selected video track");

    mocks.createMediaInput.mockReturnValueOnce({ dispose: vi.fn() });
    mocks.getClipMetadata.mockResolvedValueOnce(
      createMetadata({ audioCanDecode: false, hasAudio: true }),
    );

    await expect(
      normalizeUploadedVideo(new File(["video"], "bad-audio.mp4")),
    ).rejects.toThrow("cannot decode the selected audio track");
  });

  it("rejects missing codecs and invalid conversions", async () => {
    mocks.createMediaInput.mockReset();
    mocks.getClipMetadata.mockReset();
    mocks.getSupportedOutputCodecs.mockReset();
    mocks.conversionInit.mockReset();
    mocks.conversionInit.mockImplementation(async () => ({
      execute: mocks.conversionExecute,
      isValid: true,
      onProgress: undefined,
    }));
    mocks.createMediaInput.mockReturnValueOnce({ dispose: vi.fn() });
    mocks.getClipMetadata.mockResolvedValueOnce(createMetadata());
    mocks.getSupportedOutputCodecs.mockResolvedValueOnce({
      audioCodec: "aac",
      videoCodec: null,
      warnings: ["No video codec."],
    });

    await expect(
      normalizeUploadedVideo(new File(["video"], "no-video-codec.mp4")),
    ).rejects.toThrow("No video codec.");

    mocks.createMediaInput.mockReturnValueOnce({ dispose: vi.fn() });
    mocks.getClipMetadata.mockResolvedValueOnce(createMetadata());
    mocks.getSupportedOutputCodecs.mockResolvedValueOnce({
      audioCodec: null,
      videoCodec: "avc",
      warnings: ["Video ok", "No audio codec."],
    });

    await expect(
      normalizeUploadedVideo(new File(["video"], "no-audio-codec.mp4")),
    ).rejects.toThrow("No audio codec.");

    mocks.createMediaInput.mockReturnValueOnce({ dispose: vi.fn() });
    mocks.getClipMetadata.mockResolvedValueOnce(createMetadata({ hasAudio: false }));
    mocks.getSupportedOutputCodecs.mockResolvedValueOnce({
      audioCodec: null,
      videoCodec: "avc",
      warnings: [],
    });
    mocks.conversionInit.mockResolvedValueOnce({
      execute: vi.fn(),
      isValid: false,
    });

    await expect(
      normalizeUploadedVideo(new File(["video"], "invalid.mp4")),
    ).rejects.toThrow("could not initialize a valid conversion");
  });
});
