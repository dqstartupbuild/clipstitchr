import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_UPLOAD_VIDEO_ANALYSIS_SIZE_BYTES } from "@/lib/clipstitchr/constants/maxUploadVideoAnalysisSizeBytes";
import { createSwiprBackgroundAnalysisOutputText } from "@/lib/clipstitchr/server/createSwiprBackgroundAnalysisOutputText";
import { createUploadAnalysisPrompt } from "@/lib/clipstitchr/server/createUploadAnalysisPrompt";
import { createUploadImageAnalysisOutputText } from "@/lib/clipstitchr/server/createUploadImageAnalysisOutputText";
import { createUploadVideoAnalysisOutputText } from "@/lib/clipstitchr/server/createUploadVideoAnalysisOutputText";
import { createUploadVideoAnalysisPrompt } from "@/lib/clipstitchr/server/createUploadVideoAnalysisPrompt";
import { getUploadAnalysisModelId } from "@/lib/clipstitchr/server/getUploadAnalysisModelId";
import { getUploadAnalysisOutputText } from "@/lib/clipstitchr/server/getUploadAnalysisOutputText";
import { getUploadVideoAnalysisModelId } from "@/lib/clipstitchr/server/getUploadVideoAnalysisModelId";
import type { UploadAssetAnalysisKind } from "@/lib/clipstitchr/types/UploadAssetAnalysisKind";

const mocks = vi.hoisted(() => ({
  createReplicateInputFile: vi.fn(() => ({ kind: "replicate-file" })),
  getCompletedReplicatePredictionOutputText: vi.fn(
    async ({ prediction }: { prediction: { id: string } }) =>
      `completed:${prediction.id}`,
  ),
}));

vi.mock("@/lib/clipstitchr/server/createReplicateInputFile", () => ({
  createReplicateInputFile: mocks.createReplicateInputFile,
}));

vi.mock(
  "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText",
  () => ({
    getCompletedReplicatePredictionOutputText:
      mocks.getCompletedReplicatePredictionOutputText,
  }),
);

type ReplicateClient =
  Parameters<typeof createUploadImageAnalysisOutputText>[0]["replicate"];

function createReplicate() {
  let predictionCount = 0;
  const predictionCreate = vi.fn(async (request: unknown) => {
    predictionCount += 1;

    return {
      id: `prediction_${predictionCount}`,
      request,
    };
  });

  return {
    predictionCreate,
    replicate: {
      predictions: {
        create: predictionCreate,
      },
    } as unknown as ReplicateClient,
  };
}

function createFile(name: string, type: string) {
  return new File(["media"], name, { type });
}

describe("upload analysis helpers", () => {
  const originalAnalysisModelId = process.env.REPLICATE_UPLOAD_ANALYSIS_MODEL_ID;
  const originalVideoAnalysisModelId =
    process.env.REPLICATE_UPLOAD_VIDEO_ANALYSIS_MODEL_ID;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.REPLICATE_UPLOAD_ANALYSIS_MODEL_ID;
    delete process.env.REPLICATE_UPLOAD_VIDEO_ANALYSIS_MODEL_ID;
  });

  afterEach(() => {
    if (originalAnalysisModelId === undefined) {
      delete process.env.REPLICATE_UPLOAD_ANALYSIS_MODEL_ID;
    } else {
      process.env.REPLICATE_UPLOAD_ANALYSIS_MODEL_ID = originalAnalysisModelId;
    }

    if (originalVideoAnalysisModelId === undefined) {
      delete process.env.REPLICATE_UPLOAD_VIDEO_ANALYSIS_MODEL_ID;
    } else {
      process.env.REPLICATE_UPLOAD_VIDEO_ANALYSIS_MODEL_ID =
        originalVideoAnalysisModelId;
    }
  });

  it("builds upload analysis prompts for every media kind", () => {
    expect(
      createUploadAnalysisPrompt({
        mediaKind: "photo",
        originalName: "avatar.jpg",
      }),
    ).toContain("avatar photo");
    expect(
      createUploadAnalysisPrompt({
        mediaKind: "ugc-video",
        originalName: "creator.mov",
      }),
    ).toContain("mainPersonDescription");
    expect(
      createUploadAnalysisPrompt({
        mediaKind: "demo-video",
        originalName: "demo.mp4",
      }),
    ).toContain("productDescription");
    expect(
      createUploadAnalysisPrompt({
        mediaKind: "video",
        originalName: "",
      }),
    ).toContain("Original file name: unknown.");
    expect(
      createUploadAnalysisPrompt({
        mediaKind: "unsupported" as UploadAssetAnalysisKind,
        originalName: "fallback.mp4",
      }),
    ).toContain('"tags":["tag one","tag two"]');
  });

  it("builds full-video prompts for UGC and demo uploads", () => {
    expect(
      createUploadVideoAnalysisPrompt({
        mediaKind: "ugc-video",
        originalName: "hook.mp4",
      }),
    ).toContain("full uploaded UGC video");
    expect(
      createUploadVideoAnalysisPrompt({
        mediaKind: "demo-video",
        originalName: "",
      }),
    ).toContain("Original file name: unknown.");
  });

  it("reads upload analysis model IDs from defaults and environment", () => {
    expect(getUploadAnalysisModelId()).toBe("openai/gpt-5-mini");
    expect(getUploadVideoAnalysisModelId()).toBe("google/gemini-3-flash");

    process.env.REPLICATE_UPLOAD_ANALYSIS_MODEL_ID = "custom/image-model";
    process.env.REPLICATE_UPLOAD_VIDEO_ANALYSIS_MODEL_ID =
      "custom/video-model";

    expect(getUploadAnalysisModelId()).toBe("custom/image-model");
    expect(getUploadVideoAnalysisModelId()).toBe("custom/video-model");
  });

  it("normalizes Replicate upload analysis output values", () => {
    expect(getUploadAnalysisOutputText("ready")).toBe("ready");
    expect(getUploadAnalysisOutputText(["a", 1, "b", null])).toBe("ab");
    expect(getUploadAnalysisOutputText({ output: "ignored" })).toBe("");
  });

  it("creates image analysis predictions with media-specific token budgets", async () => {
    const { predictionCreate, replicate } = createReplicate();

    await expect(
      createUploadImageAnalysisOutputText({
        file: createFile("", "image/png"),
        mediaKind: "photo",
        originalName: "avatar.png",
        replicate,
      }),
    ).resolves.toBe("completed:prediction_1");
    expect(mocks.createReplicateInputFile).toHaveBeenCalledWith({
      fallbackFileName: "upload-analysis.jpg",
      file: expect.any(File),
      mimeType: "image/jpeg",
    });
    expect(predictionCreate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          max_completion_tokens: 400,
          prompt: expect.stringContaining("avatar photo"),
        }),
        model: "openai/gpt-5-mini",
      }),
    );

    await expect(
      createUploadImageAnalysisOutputText({
        file: createFile("creator.jpg", "image/jpeg"),
        mediaKind: "ugc-video",
        originalName: "creator.mov",
        replicate,
      }),
    ).resolves.toBe("completed:prediction_2");
    expect(predictionCreate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          max_completion_tokens: 700,
          prompt: expect.stringContaining("uploaded UGC video"),
        }),
      }),
    );
    expect(
      String(
        (
          predictionCreate.mock.calls.at(-1)?.[0] as {
            input?: { prompt?: string };
          }
        ).input?.prompt,
      ),
    ).toContain("performanceScore");
  });

  it("creates Swipr background analysis predictions", async () => {
    const { predictionCreate, replicate } = createReplicate();

    await expect(
      createSwiprBackgroundAnalysisOutputText({
        file: createFile("studio.jpg", "image/jpeg"),
        originalName: "studio.jpg",
        replicate,
      }),
    ).resolves.toBe("completed:prediction_1");
    expect(mocks.createReplicateInputFile).toHaveBeenCalledWith({
      fallbackFileName: "swipr-background-analysis.jpg",
      file: expect.any(File),
      mimeType: "image/jpeg",
    });
    expect(predictionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          max_completion_tokens: 700,
          prompt: expect.stringContaining("carousel background image"),
        }),
      }),
    );
    expect(mocks.getCompletedReplicatePredictionOutputText).toHaveBeenCalledWith(
      expect.objectContaining({
        failureMessage: "Replicate did not complete Swipr background analysis.",
      }),
    );
  });

  it("analyzes a video source URL before using poster fallback analysis", async () => {
    const { predictionCreate, replicate } = createReplicate();

    await expect(
      createUploadVideoAnalysisOutputText({
        fallbackImageFile: createFile("poster.jpg", "image/jpeg"),
        mediaKind: "ugc-video",
        originalName: "creator.mp4",
        replicate,
        sourceSizeBytes: 42,
        sourceUrl: "https://r2.example/creator.mp4",
      }),
    ).resolves.toBe("completed:prediction_1");
    expect(predictionCreate).toHaveBeenCalledTimes(1);
    expect(predictionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          max_output_tokens: 2800,
          prompt: expect.stringContaining("full uploaded UGC video"),
          videos: ["https://r2.example/creator.mp4"],
        }),
        model: "google/gemini-3-flash",
      }),
    );
  });

  it("falls back to poster image analysis when video analysis fails", async () => {
    const { predictionCreate, replicate } = createReplicate();

    mocks.getCompletedReplicatePredictionOutputText.mockRejectedValueOnce(
      new Error("video failed"),
    );

    await expect(
      createUploadVideoAnalysisOutputText({
        fallbackImageFile: createFile("poster.jpg", "image/jpeg"),
        file: createFile("creator.mp4", "video/mp4"),
        mediaKind: "ugc-video",
        originalName: "creator.mp4",
        replicate,
      }),
    ).resolves.toBe("completed:prediction_2");
    expect(predictionCreate).toHaveBeenCalledTimes(2);
    expect(predictionCreate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          image_input: [expect.objectContaining({ kind: "replicate-file" })],
        }),
      }),
    );
  });

  it("uses poster fallback for oversized videos and errors without it", async () => {
    const { predictionCreate, replicate } = createReplicate();

    await expect(
      createUploadVideoAnalysisOutputText({
        fallbackImageFile: createFile("poster.jpg", "image/jpeg"),
        mediaKind: "demo-video",
        originalName: "demo.mp4",
        replicate,
        sourceSizeBytes: MAX_UPLOAD_VIDEO_ANALYSIS_SIZE_BYTES + 1,
        sourceUrl: "https://r2.example/demo.mp4",
      }),
    ).resolves.toBe("completed:prediction_1");
    expect(predictionCreate).toHaveBeenCalledTimes(1);
    expect(predictionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          prompt: expect.stringContaining("product demo video"),
        }),
      }),
    );

    await expect(
      createUploadVideoAnalysisOutputText({
        mediaKind: "demo-video",
        originalName: "too-large.mp4",
        replicate,
        sourceSizeBytes: MAX_UPLOAD_VIDEO_ANALYSIS_SIZE_BYTES + 1,
        sourceUrl: "https://r2.example/too-large.mp4",
      }),
    ).rejects.toThrow("Video analysis supports videos up to 95 MB.");
  });

  it("requires a poster fallback when video input is unavailable", async () => {
    const { replicate } = createReplicate();

    await expect(
      createUploadVideoAnalysisOutputText({
        mediaKind: "ugc-video",
        originalName: "missing.mp4",
        replicate,
      }),
    ).rejects.toThrow("Video poster fallback is unavailable.");
  });
});
