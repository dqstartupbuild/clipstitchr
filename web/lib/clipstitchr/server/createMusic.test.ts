import { beforeEach, describe, expect, it, vi } from "vitest";
import { createCliprMusic } from "@/lib/clipstitchr/server/createCliprMusic";
import { createLibraryMusic } from "@/lib/clipstitchr/server/createLibraryMusic";
import { createStitchMusic } from "@/lib/clipstitchr/server/createStitchMusic";

const mocks = vi.hoisted(() => ({
  fetchReplicateOutput: vi.fn(),
  getCliprMusicModelId: vi.fn(),
  getReplicateOutputUrl: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/fetchReplicateOutput", () => ({
  fetchReplicateOutput: mocks.fetchReplicateOutput,
}));

vi.mock("@/lib/clipstitchr/server/getCliprMusicModelId", () => ({
  getCliprMusicModelId: mocks.getCliprMusicModelId,
}));

vi.mock("@/lib/clipstitchr/server/getReplicateOutputUrl", () => ({
  getReplicateOutputUrl: mocks.getReplicateOutputUrl,
}));

function createReplicate(status = "succeeded", error?: unknown) {
  return {
    predictions: {
      create: vi.fn(async () => ({ id: "prediction_start" })),
    },
    wait: vi.fn(async () => ({
      error,
      id: "prediction_done",
      output: ["https://replicate.test/output.mp3"],
      status,
    })),
  };
}

describe("create music server helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCliprMusicModelId.mockReturnValue("music-model");
    mocks.getReplicateOutputUrl.mockReturnValue("https://replicate.test/output.mp3");
    mocks.fetchReplicateOutput.mockResolvedValue({
      arrayBuffer: vi.fn(async () => new Uint8Array([1, 2, 3]).buffer),
      headers: {
        get: vi.fn(() => "audio/wav"),
      },
    });
  });

  it("creates Clipr, library, and stitch music from completed Replicate outputs", async () => {
    const cliprReplicate = createReplicate();
    const libraryReplicate = createReplicate();
    const stitchReplicate = createReplicate();

    await expect(
      createCliprMusic({
        audienceDetails: "Founders",
        productName: "Launch Kit",
        replicate: cliprReplicate as never,
        script: "This saves time.",
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        contentType: "audio/wav",
        modelId: "music-model",
        predictionId: "prediction_done",
      }),
    );
    await expect(
      createLibraryMusic({
        replicate: libraryReplicate as never,
        style: "bright pop",
      }),
    ).resolves.toEqual(expect.objectContaining({ contentType: "audio/wav" }));
    await expect(
      createStitchMusic({
        replicate: stitchReplicate as never,
        stitch: {
          demoClipName: "Demo",
          textOverlay: {
            backgroundColor: "#000000",
            color: "#ffffff",
            endTime: 3,
            fontSize: 48,
            startTime: 0,
            styleId: "hook",
            text: "Hook",
            width: 0.8,
            x: 0.5,
            y: 0.5,
          },
          ugcClipName: "UGC",
        },
      }),
    ).resolves.toEqual(expect.objectContaining({ contentType: "audio/wav" }));

    expect(cliprReplicate.predictions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "music-model",
      }),
    );
    expect(mocks.fetchReplicateOutput).toHaveBeenCalledWith(
      "https://replicate.test/output.mp3",
    );
  });

  it("falls back to MPEG content type and propagates provider failures", async () => {
    mocks.fetchReplicateOutput.mockResolvedValueOnce({
      arrayBuffer: vi.fn(async () => new Uint8Array([1]).buffer),
      headers: {
        get: vi.fn(() => "application/octet-stream"),
      },
    });

    await expect(
      createLibraryMusic({
        replicate: createReplicate() as never,
      }),
    ).resolves.toEqual(expect.objectContaining({ contentType: "audio/mpeg" }));

    await expect(
      createCliprMusic({
        audienceDetails: "",
        productName: "Launch Kit",
        replicate: createReplicate("failed", "Provider failed") as never,
        script: "Script",
      }),
    ).rejects.toThrow("Provider failed");
    await expect(
      createStitchMusic({
        replicate: createReplicate("failed") as never,
        stitch: {
          demoClipName: "Demo",
          ugcClipName: "UGC",
        },
      }),
    ).rejects.toThrow("Replicate did not complete stitch music generation.");
  });
});
