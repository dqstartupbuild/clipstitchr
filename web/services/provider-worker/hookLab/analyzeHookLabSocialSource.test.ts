import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  assertDuration: vi.fn(),
  createAnalysis: vi.fn(),
  createReplicateClient: vi.fn(),
  createThumbnail: vi.fn(),
  deleteTemporarySourceVideo: vi.fn(),
  deleteTemporaryVideo: vi.fn(),
  fetchRemoteVideo: vi.fn(),
  getDuration: vi.fn(),
  getR2DownloadSignedUrl: vi.fn(),
  loadSocialSource: vi.fn(),
  recordPrediction: vi.fn(),
  saveTemporarySourceVideo: vi.fn(),
  writeTemporaryVideo: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/createReplicateClient", () => ({
  createReplicateClient: mocks.createReplicateClient,
}));
vi.mock("@/lib/clipstitchr/server/hookLab/deleteHookLabTemporaryVideo", () => ({
  deleteHookLabTemporaryVideo: mocks.deleteTemporaryVideo,
}));
vi.mock("@/lib/clipstitchr/server/hookLab/fetchHookLabRemoteVideo", () => ({
  fetchHookLabRemoteVideo: mocks.fetchRemoteVideo,
}));
vi.mock("@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl", () => ({
  getR2DownloadSignedUrl: mocks.getR2DownloadSignedUrl,
}));
vi.mock("./assertHookLabVideoDuration", () => ({
  assertHookLabVideoDuration: mocks.assertDuration,
}));
vi.mock("./createHookLabIdeaAnalysis", () => ({
  createHookLabIdeaAnalysis: mocks.createAnalysis,
}));
vi.mock("./createHookLabVideoThumbnail", () => ({
  createHookLabVideoThumbnail: mocks.createThumbnail,
}));
vi.mock("./deleteHookLabTemporarySourceVideo", () => ({
  deleteHookLabTemporarySourceVideo: mocks.deleteTemporarySourceVideo,
}));
vi.mock("./getHookLabVideoDuration", () => ({
  getHookLabVideoDuration: mocks.getDuration,
}));
vi.mock("./loadHookLabSocialSource", () => ({
  loadHookLabSocialSource: mocks.loadSocialSource,
}));
vi.mock("./recordHookLabAnalysisPrediction", () => ({
  recordHookLabAnalysisPrediction: mocks.recordPrediction,
}));
vi.mock("./saveHookLabTemporarySourceVideo", () => ({
  saveHookLabTemporarySourceVideo: mocks.saveTemporarySourceVideo,
}));
vi.mock("./writeHookLabTemporaryVideo", () => ({
  writeHookLabTemporaryVideo: mocks.writeTemporaryVideo,
}));

import { analyzeHookLabSocialSource } from "./analyzeHookLabSocialSource";

const client = { mutation: vi.fn().mockResolvedValue(null) };
const idea = {
  canonicalUrl: "https://www.instagram.com/reel/source/",
  id: "idea_1",
  sourcePlatform: "instagram",
  sourceType: "social_link",
} as const;
const job = {
  id: "provider_1",
  inputSnapshotJson: "{}",
  ownerId: "owner_1",
  stage: "running",
};

describe("analyzeHookLabSocialSource", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    client.mutation.mockResolvedValue(null);
    mocks.createReplicateClient.mockReturnValue({});
    mocks.loadSocialSource.mockResolvedValue({
      canonicalUrl: "https://www.instagram.com/reel/source/",
      platform: "instagram",
      sourceText: "A source hook",
      temporaryVideoUrl: "https://cdn.example.com/source.mp4",
    });
    mocks.fetchRemoteVideo.mockResolvedValue({
      bytes: new Uint8Array([0, 1, 2, 3]),
      contentType: "video/mp4",
    });
    mocks.writeTemporaryVideo.mockResolvedValue("/tmp/hook-lab-source.mp4");
    mocks.getDuration.mockResolvedValue(12);
    mocks.createThumbnail.mockResolvedValue(null);
    mocks.deleteTemporaryVideo.mockResolvedValue(undefined);
    mocks.deleteTemporarySourceVideo.mockResolvedValue(undefined);
    mocks.recordPrediction.mockResolvedValue(undefined);
    mocks.saveTemporarySourceVideo.mockResolvedValue({
      contentType: "video/mp4",
      key: "users/owner_1/hook-lab-sources/provider_1/source.mp4",
      size: 4,
    });
    mocks.getR2DownloadSignedUrl.mockResolvedValue({
      expiresIn: 900,
      url: "https://r2.example/hook-lab-sources/provider_1/source.mp4",
    });
  });

  it("analyzes a signed temporary R2 URL and records the prediction immediately", async () => {
    mocks.createAnalysis.mockImplementation(
      async (options: {
        onPredictionCreated: (prediction: { id: string }) => Promise<void>;
      }) => {
        await options.onPredictionCreated({ id: "prediction_1" });

        return {
          creativeBeat: {},
          modelId: "google/gemini-3-flash",
          name: "Imported opening",
          predictionId: "prediction_1",
          textBlueprint: {},
          whatToRepeat: "Keep the reveal",
        };
      },
    );

    await analyzeHookLabSocialSource({
      client: client as never,
      idea,
      job,
      providerWorkerSecret: "provider-secret",
    });

    expect(mocks.saveTemporarySourceVideo).toHaveBeenCalledWith({
      body: new Uint8Array([0, 1, 2, 3]),
      contentType: "video/mp4",
      ownerId: "owner_1",
      recordId: "provider_1",
    });
    expect(mocks.createAnalysis).toHaveBeenCalledWith(
      expect.objectContaining({
        videoUrl:
          "https://r2.example/hook-lab-sources/provider_1/source.mp4",
      }),
    );
    expect(mocks.createAnalysis).toHaveBeenCalledWith(
      expect.not.objectContaining({ videoFile: expect.anything() }),
    );
    expect(mocks.recordPrediction).toHaveBeenCalledWith({
      client,
      job,
      predictionId: "prediction_1",
      providerWorkerSecret: "provider-secret",
    });
    expect(mocks.deleteTemporarySourceVideo).toHaveBeenCalledWith({
      objectKey: "users/owner_1/hook-lab-sources/provider_1/source.mp4",
    });
  });

  it("deletes local and R2 temporary videos when provider analysis fails", async () => {
    mocks.createAnalysis.mockRejectedValue(new Error("Provider failed"));

    await expect(
      analyzeHookLabSocialSource({
        client: client as never,
        idea,
        job,
        providerWorkerSecret: "provider-secret",
      }),
    ).rejects.toThrow("Provider failed");
    expect(mocks.deleteTemporaryVideo).toHaveBeenCalledWith({
      filePath: "/tmp/hook-lab-source.mp4",
    });
    expect(mocks.deleteTemporarySourceVideo).toHaveBeenCalledWith({
      objectKey: "users/owner_1/hook-lab-sources/provider_1/source.mp4",
    });
  });

  it("waits for a successful thumbnail before cleaning up a failed analysis", async () => {
    let resolveThumbnail: ((value: {
      body: Uint8Array;
      filePath: string;
    }) => void) | undefined;
    const thumbnailPromise = new Promise<{
      body: Uint8Array;
      filePath: string;
    }>((resolve) => {
      resolveThumbnail = resolve;
    });

    mocks.createAnalysis.mockRejectedValue(new Error("Provider failed"));
    mocks.createThumbnail.mockReturnValue(thumbnailPromise);

    const analysisPromise = analyzeHookLabSocialSource({
      client: client as never,
      idea,
      job,
      providerWorkerSecret: "provider-secret",
    });

    await vi.waitFor(() => {
      expect(mocks.createThumbnail).toHaveBeenCalled();
    });
    expect(mocks.deleteTemporaryVideo).not.toHaveBeenCalled();

    resolveThumbnail?.({
      body: new Uint8Array([4, 5, 6]),
      filePath: "/tmp/hook-lab-thumbnail.jpg",
    });

    await expect(analysisPromise).rejects.toThrow("Provider failed");
    expect(mocks.deleteTemporaryVideo).toHaveBeenCalledWith({
      filePath: "/tmp/hook-lab-source.mp4",
    });
    expect(mocks.deleteTemporaryVideo).toHaveBeenCalledWith({
      filePath: "/tmp/hook-lab-thumbnail.jpg",
    });
  });

  it("preserves successful analysis when bounded R2 cleanup needs an alert", async () => {
    mocks.createAnalysis.mockResolvedValue({
      creativeBeat: {},
      modelId: "google/gemini-3-flash",
      name: "Imported opening",
      predictionId: "prediction_1",
      textBlueprint: {},
      whatToRepeat: "Keep the reveal",
    });
    mocks.deleteTemporarySourceVideo.mockRejectedValue(
      new Error("request signature abc-secret was rejected"),
    );
    const errorLog = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(
      analyzeHookLabSocialSource({
        client: client as never,
        idea,
        job,
        providerWorkerSecret: "provider-secret",
      }),
    ).resolves.toEqual(expect.objectContaining({ predictionId: "prediction_1" }));
    expect(errorLog).toHaveBeenCalledWith(
      "Hook Lab temporary source video cleanup failed.",
      { jobId: "provider_1" },
    );
  });

  it("preserves the original analysis error when R2 cleanup also fails", async () => {
    mocks.createAnalysis.mockRejectedValue(
      new Error("Unknown mime type: set the mime_type argument"),
    );
    mocks.deleteTemporarySourceVideo.mockRejectedValue(
      new Error("request signature abc-secret was rejected"),
    );
    const errorLog = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(
      analyzeHookLabSocialSource({
        client: client as never,
        idea,
        job,
        providerWorkerSecret: "provider-secret",
      }),
    ).rejects.toThrow("Unknown mime type");
    expect(errorLog).toHaveBeenCalledWith(
      "Hook Lab temporary source video cleanup failed.",
      { jobId: "provider_1" },
    );
  });
});
