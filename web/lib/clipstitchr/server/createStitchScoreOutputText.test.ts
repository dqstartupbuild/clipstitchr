import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createStitchScoreOutputText } from "@/lib/clipstitchr/server/createStitchScoreOutputText";

const mocks = vi.hoisted(() => ({
  createFileFromR2Object: vi.fn(),
  createStitchScoreVideoInputs: vi.fn(),
  getCompletedReplicatePredictionOutputText: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/createStitchScoreVideoInputs", () => ({
  createStitchScoreVideoInputs: mocks.createStitchScoreVideoInputs,
}));

vi.mock(
  "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText",
  () => ({
    getCompletedReplicatePredictionOutputText:
      mocks.getCompletedReplicatePredictionOutputText,
  }),
);

vi.mock("@/lib/clipstitchr/server/r2/createFileFromR2Object", () => ({
  createFileFromR2Object: mocks.createFileFromR2Object,
}));

function createReplicate() {
  return {
    predictions: {
      create: vi
        .fn()
        .mockResolvedValueOnce({ id: "video_prediction" })
        .mockResolvedValueOnce({ id: "fallback_prediction" }),
    },
    wait: vi.fn(),
  };
}

const stitch = {
  demoClipName: "Demo",
  duration: 12,
  id: "stitch_1",
  name: "Stitch",
  posterObject: {
    contentType: "image/jpeg",
    key: "users/user_123/stitches/stitch_1/poster.jpg",
    size: 100,
  },
  textOverlay: { text: "Wait for this" },
  ugcClipName: "UGC",
};
const sourceClips = [
  {
    clipType: "ugc",
    duration: 6,
    id: "ugc_1",
    name: "UGC",
    videoDescription: "Creator looks surprised, then points to the demo.",
  },
];

describe("createStitchScoreOutputText", () => {
  const previousUploadAnalysisModelId =
    process.env.REPLICATE_UPLOAD_ANALYSIS_MODEL_ID;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.REPLICATE_UPLOAD_ANALYSIS_MODEL_ID;
    mocks.createStitchScoreVideoInputs.mockResolvedValue({
      videoInputDescription: "Rendered stitch video.",
      videos: ["https://r2.example/stitch.mp4"],
    });
    mocks.createFileFromR2Object.mockResolvedValue(
      new File(["poster"], "poster.jpg", { type: "image/jpeg" }),
    );
  });

  afterEach(() => {
    if (previousUploadAnalysisModelId === undefined) {
      delete process.env.REPLICATE_UPLOAD_ANALYSIS_MODEL_ID;
      return;
    }

    process.env.REPLICATE_UPLOAD_ANALYSIS_MODEL_ID =
      previousUploadAnalysisModelId;
  });

  it("falls back to poster scoring when Gemini video scoring fails", async () => {
    const replicate = createReplicate();

    mocks.getCompletedReplicatePredictionOutputText
      .mockRejectedValueOnce(
        new Error(
          "Prediction failed: Async prediction failed: ModelError: E001",
        ),
      )
      .mockResolvedValueOnce("fallback score");

    await expect(
      createStitchScoreOutputText({
        replicate: replicate as never,
        sourceClips: sourceClips as never,
        stitch: stitch as never,
        userId: "user_123",
      }),
    ).resolves.toBe("fallback score");

    expect(replicate.predictions.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        model: "google/gemini-3-flash",
        input: expect.objectContaining({
          videos: ["https://r2.example/stitch.mp4"],
        }),
      }),
    );
    expect(mocks.createFileFromR2Object).toHaveBeenCalledWith({
      fallbackFileName: "stitch-score-poster.jpg",
      object: stitch.posterObject,
      userId: "user_123",
    });
    expect(replicate.predictions.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        model: "openai/gpt-5-mini",
        input: expect.objectContaining({
          image_input: [expect.any(File)],
          max_completion_tokens: 1400,
          prompt: expect.stringContaining("Video analysis was unavailable"),
          system_prompt: expect.stringContaining("poster frame"),
        }),
      }),
    );
  });
});
