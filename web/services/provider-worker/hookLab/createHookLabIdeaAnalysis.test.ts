import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCompletedOutput: vi.fn(),
  getUploadVideoAnalysisModelId: vi.fn(() => "google/gemini-3-flash"),
  parseAnalysis: vi.fn(() => ({
    creativeBeat: {},
    name: "Imported opening",
    textBlueprint: {},
    whatToRepeat: "Keep the reveal",
  })),
}));

vi.mock(
  "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText",
  () => ({
    getCompletedReplicatePredictionOutputText: mocks.getCompletedOutput,
  }),
);
vi.mock("@/lib/clipstitchr/server/getUploadVideoAnalysisModelId", () => ({
  getUploadVideoAnalysisModelId: mocks.getUploadVideoAnalysisModelId,
}));
vi.mock("./parseHookLabIdeaAnalysis", () => ({
  parseHookLabIdeaAnalysis: mocks.parseAnalysis,
}));

import { createHookLabIdeaAnalysis } from "./createHookLabIdeaAnalysis";

describe("createHookLabIdeaAnalysis", () => {
  it("passes a validated media URL without creating a Replicate File input", async () => {
    const prediction = { id: "prediction_1", status: "starting" };
    const predictionsCreate = vi.fn().mockResolvedValue(prediction);
    const onPredictionCreated = vi.fn().mockResolvedValue(undefined);

    mocks.getCompletedOutput.mockImplementation(async () => {
      expect(onPredictionCreated).toHaveBeenCalledWith(prediction);
      return "{}";
    });

    await createHookLabIdeaAnalysis({
      onPredictionCreated,
      originalText: "Watch this",
      replicate: { predictions: { create: predictionsCreate } } as never,
      sourceType: "social_link",
      videoUrl: "https://r2.example/hook-lab/source.mp4?signature=temporary",
    });

    expect(predictionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "google/gemini-3-flash",
        input: expect.objectContaining({
          videos: [
            "https://r2.example/hook-lab/source.mp4?signature=temporary",
          ],
        }),
      }),
    );
    const videos = predictionsCreate.mock.calls[0]?.[0].input.videos;

    expect(videos[0]).toEqual(expect.any(String));
    expect(videos[0]).not.toBeInstanceOf(File);
  });

  it("keeps polling when the prediction checkpoint is temporarily unavailable", async () => {
    const prediction = { id: "prediction_2", status: "starting" };
    const predictionsCreate = vi.fn().mockResolvedValue(prediction);
    const onPredictionCreated = vi
      .fn()
      .mockRejectedValue(new Error("Convex temporarily unavailable"));
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    mocks.getCompletedOutput.mockResolvedValue("{}");

    await expect(
      createHookLabIdeaAnalysis({
        onPredictionCreated,
        replicate: { predictions: { create: predictionsCreate } } as never,
        sourceType: "social_link",
        videoUrl: "https://r2.example/hook-lab/source.mp4?signature=temporary",
      }),
    ).resolves.toEqual(expect.objectContaining({ predictionId: "prediction_2" }));
    expect(onPredictionCreated).toHaveBeenCalledWith(prediction);
    expect(mocks.getCompletedOutput).toHaveBeenCalledWith(
      expect.objectContaining({ prediction }),
    );
    expect(warning).toHaveBeenCalledWith(
      "Hook Lab prediction lineage checkpoint failed.",
    );
  });
});
