import { describe, expect, it, vi } from "vitest";
import { analyzeHookLabOwnedSource } from "./analyzeHookLabOwnedSource";

const mocks = vi.hoisted(() => ({
  createHookLabFileFromR2Object: vi.fn(),
  createHookLabIdeaAnalysis: vi.fn(),
  createReplicateClient: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/createReplicateClient", () => ({
  createReplicateClient: mocks.createReplicateClient,
}));
vi.mock(
  "@/lib/clipstitchr/server/hookLab/createHookLabFileFromR2Object",
  () => ({
    createHookLabFileFromR2Object: mocks.createHookLabFileFromR2Object,
  }),
);
vi.mock("./createHookLabIdeaAnalysis", () => ({
  createHookLabIdeaAnalysis: mocks.createHookLabIdeaAnalysis,
}));

describe("analyzeHookLabOwnedSource", () => {
  it("checks the downloaded bytes instead of trusting the stored clip size", async () => {
    const videoFile = new File([new Uint8Array([1])], "opening.mp4", {
      type: "video/mp4",
    });

    mocks.createReplicateClient.mockReturnValue({});
    mocks.createHookLabFileFromR2Object.mockResolvedValue(videoFile);
    mocks.createHookLabIdeaAnalysis.mockResolvedValue({
      creativeBeat: {},
      modelId: "model_1",
      name: "Saved opening",
      predictionId: "prediction_1",
      textBlueprint: {},
      whatToRepeat: "Keep the reveal",
    });

    await analyzeHookLabOwnedSource({
      analysisInput: {
        idea: {
          id: "idea_1",
          originalText: "Watch this",
          sourceType: "stitch",
        },
        sourceUgcClip: {
          originalName: "opening.mp4",
          size: Number.MAX_SAFE_INTEGER,
          videoObject: {
            contentType: "video/mp4",
            key: "users/owner_1/video-clips/clip_1/video.mp4",
            size: 1,
          },
        },
      },
      idea: {
        id: "idea_1",
        originalText: "Watch this",
        sourceType: "stitch",
      },
      job: {
        id: "provider_1",
        inputSnapshotJson: "{}",
        ownerId: "owner_1",
        stage: "awaiting-provider",
      },
    });

    expect(mocks.createHookLabFileFromR2Object).toHaveBeenCalledWith({
      fallbackFileName: "opening.mp4",
      maxBytes: 100 * 1024 * 1024,
      object: expect.objectContaining({ key: expect.stringContaining("clip_1") }),
      timeoutMs: 60_000,
      userId: "owner_1",
    });
    expect(mocks.createHookLabIdeaAnalysis).toHaveBeenCalledWith(
      expect.objectContaining({ videoFile }),
    );
  });
});
