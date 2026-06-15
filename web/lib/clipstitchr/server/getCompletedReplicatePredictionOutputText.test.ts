import type { Prediction } from "replicate";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";

describe("getCompletedReplicatePredictionOutputText", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs the latest prediction diagnostics when waiting throws", async () => {
    const waitError = new Error("Prediction failed: signed URL failed");
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const prediction = {
      id: "prediction_123",
      status: "processing",
    } as Prediction;
    const latestPrediction = {
      error: "Provider could not fetch https://example.com/video.mp4?secret=1",
      id: "prediction_123",
      status: "failed",
    } as Prediction;
    const replicate = {
      predictions: {
        get: vi.fn(async () => latestPrediction),
      },
      wait: vi.fn(async () => {
        throw waitError;
      }),
    };

    await expect(
      getCompletedReplicatePredictionOutputText({
        failureMessage: "Replicate did not complete video upload analysis.",
        prediction,
        predictionDiagnostics: {
          featurePath: "upload-analysis",
          modelId: "google/gemini-3-flash",
        },
        replicate: replicate as never,
      }),
    ).rejects.toThrow(waitError);

    expect(replicate.predictions.get).toHaveBeenCalledWith("prediction_123");
    expect(infoSpy).toHaveBeenCalledWith(
      JSON.stringify({
        event: "gemini-video-analysis-prediction",
        featurePath: "upload-analysis",
        modelId: "google/gemini-3-flash",
        predictionId: "prediction_123",
        predictionStatus: "failed",
        predictionError: "Provider could not fetch [redacted-url]",
      }),
    );
  });
});
