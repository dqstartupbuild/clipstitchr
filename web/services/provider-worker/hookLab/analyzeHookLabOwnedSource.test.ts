import { beforeEach, describe, expect, it, vi } from "vitest";
import { analyzeHookLabOwnedSource } from "./analyzeHookLabOwnedSource";

const mocks = vi.hoisted(() => ({
  createHookLabIdeaAnalysis: vi.fn(),
  createReplicateClient: vi.fn(),
  getValidatedHookLabR2VideoUrl: vi.fn(),
  recordPrediction: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/createReplicateClient", () => ({
  createReplicateClient: mocks.createReplicateClient,
}));
vi.mock(
  "@/lib/clipstitchr/server/hookLab/getValidatedHookLabR2VideoUrl",
  () => ({
    getValidatedHookLabR2VideoUrl: mocks.getValidatedHookLabR2VideoUrl,
  }),
);
vi.mock("./createHookLabIdeaAnalysis", () => ({
  createHookLabIdeaAnalysis: mocks.createHookLabIdeaAnalysis,
}));
vi.mock("./recordHookLabAnalysisPrediction", () => ({
  recordHookLabAnalysisPrediction: mocks.recordPrediction,
}));

describe("analyzeHookLabOwnedSource", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("validates the owned video before analyzing a fresh signed URL", async () => {
    const client = { mutation: vi.fn() };
    const job = {
      id: "provider_1",
      inputSnapshotJson: "{}",
      ownerId: "owner_1",
      stage: "awaiting-provider",
    };

    mocks.createReplicateClient.mockReturnValue({});
    mocks.getValidatedHookLabR2VideoUrl.mockResolvedValue(
      "https://r2.example/fresh/opening.mp4",
    );
    mocks.recordPrediction.mockResolvedValue(undefined);
    mocks.createHookLabIdeaAnalysis.mockImplementation(
      async (options: {
        onPredictionCreated: (prediction: { id: string }) => Promise<void>;
      }) => {
        await options.onPredictionCreated({ id: "prediction_1" });

        return {
          creativeBeat: {},
          modelId: "model_1",
          name: "Saved opening",
          predictionId: "prediction_1",
          textBlueprint: {},
          whatToRepeat: "Keep the reveal",
        };
      },
    );

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
      client: client as never,
      idea: {
        id: "idea_1",
        originalText: "Watch this",
        sourceType: "stitch",
      },
      job,
      providerWorkerSecret: "provider-secret",
    });

    expect(mocks.getValidatedHookLabR2VideoUrl).toHaveBeenCalledWith({
      maxBytes: 100 * 1024 * 1024,
      object: expect.objectContaining({ key: expect.stringContaining("clip_1") }),
      timeoutMs: 60_000,
      userId: "owner_1",
    });
    expect(mocks.createHookLabIdeaAnalysis).toHaveBeenCalledWith(
      expect.objectContaining({
        videoUrl: "https://r2.example/fresh/opening.mp4",
      }),
    );
    expect(mocks.createHookLabIdeaAnalysis).toHaveBeenCalledWith(
      expect.not.objectContaining({ videoFile: expect.anything() }),
    );
    expect(mocks.recordPrediction).toHaveBeenCalledWith({
      client,
      job,
      predictionId: "prediction_1",
      providerWorkerSecret: "provider-secret",
    });
  });
});
