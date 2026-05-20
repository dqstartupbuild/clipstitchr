import { beforeEach, describe, expect, it, vi } from "vitest";
import { createVideoBlobWithPosterMetadata } from "@/lib/clipstitchr/media/createVideoBlobWithPosterMetadata";

const mocks = vi.hoisted(() => ({
  conversionExecute: vi.fn(),
  conversionInit: vi.fn(),
  createMediaInput: vi.fn(),
  createMp4Output: vi.fn(),
  createVideoBlobFromBuffer: vi.fn(),
  createVideoPosterBlob: vi.fn(),
  getVideoMimeType: vi.fn(),
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

vi.mock("@/lib/clipstitchr/media/createVideoPosterBlob", () => ({
  createVideoPosterBlob: mocks.createVideoPosterBlob,
}));

vi.mock("@/lib/clipstitchr/media/getVideoMimeType", () => ({
  getVideoMimeType: mocks.getVideoMimeType,
}));

describe("createVideoBlobWithPosterMetadata", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createMediaInput.mockReturnValue({ dispose: vi.fn() });
    mocks.createMp4Output.mockReturnValue({
      target: {
        buffer: new Uint8Array([1, 2, 3]).buffer,
      },
    });
    mocks.conversionInit.mockResolvedValue({
      execute: mocks.conversionExecute,
      isValid: true,
    });
    mocks.createVideoPosterBlob.mockResolvedValue(
      new Blob(["fallback-poster"], { type: "image/jpeg" }),
    );
    mocks.getVideoMimeType.mockResolvedValue("video/mp4");
    mocks.createVideoBlobFromBuffer.mockReturnValue(
      new Blob(["tagged"], { type: "video/mp4" }),
    );
  });

  it("embeds explicit poster metadata and returns the encoded video blob", async () => {
    const posterBlob = new Blob(["poster"], { type: "image/png" });

    await expect(
      createVideoBlobWithPosterMetadata({
        posterBlob,
        title: " Clip Title ",
        videoBlob: new Blob(["video"], { type: "video/mp4" }),
      }),
    ).resolves.toEqual(expect.any(Blob));

    const initOptions = mocks.conversionInit.mock.calls[0][0];

    expect(initOptions.tags({ title: "Original" })).toEqual({
      images: [
        expect.objectContaining({
          description: "Clip Title",
          kind: "coverFront",
          mimeType: "image/png",
          name: "poster.jpg",
        }),
      ],
      title: "Clip Title",
    });
    expect(mocks.conversionExecute).toHaveBeenCalled();
    expect(mocks.createVideoBlobFromBuffer).toHaveBeenCalledWith(
      expect.any(ArrayBuffer),
      "video/mp4",
    );
  });

  it("uses a generated poster and returns the source when conversion is invalid", async () => {
    const videoBlob = new Blob(["video"], { type: "video/mp4" });

    mocks.conversionInit.mockResolvedValueOnce({
      execute: mocks.conversionExecute,
      isValid: false,
    });

    await expect(
      createVideoBlobWithPosterMetadata({
        title: "Clip",
        videoBlob,
      }),
    ).resolves.toBe(videoBlob);
    expect(mocks.createVideoPosterBlob).toHaveBeenCalledWith(videoBlob);
  });

  it("returns the source video when no poster can be created", async () => {
    const videoBlob = new Blob(["video"], { type: "video/mp4" });

    mocks.createVideoPosterBlob.mockRejectedValueOnce(new Error("No poster"));

    await expect(
      createVideoBlobWithPosterMetadata({ videoBlob }),
    ).resolves.toBe(videoBlob);
    expect(mocks.createMediaInput).not.toHaveBeenCalled();
  });
});
