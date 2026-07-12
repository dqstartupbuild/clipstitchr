import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  assertDuration: vi.fn(),
  createAnalysis: vi.fn(),
  createReplicateClient: vi.fn(() => ({})),
  createThumbnail: vi.fn(),
  deleteTemporaryVideo: vi.fn(),
  fetchRemoteVideo: vi.fn(),
  getDuration: vi.fn(),
  loadSocialSource: vi.fn(),
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
vi.mock("./assertHookLabVideoDuration", () => ({
  assertHookLabVideoDuration: mocks.assertDuration,
}));
vi.mock("./createHookLabIdeaAnalysis", () => ({
  createHookLabIdeaAnalysis: mocks.createAnalysis,
}));
vi.mock("./createHookLabVideoThumbnail", () => ({
  createHookLabVideoThumbnail: mocks.createThumbnail,
}));
vi.mock("./getHookLabVideoDuration", () => ({
  getHookLabVideoDuration: mocks.getDuration,
}));
vi.mock("./loadHookLabSocialSource", () => ({
  loadHookLabSocialSource: mocks.loadSocialSource,
}));
vi.mock("./writeHookLabTemporaryVideo", () => ({
  writeHookLabTemporaryVideo: mocks.writeTemporaryVideo,
}));

import { analyzeHookLabSocialSource } from "./analyzeHookLabSocialSource";

describe("analyzeHookLabSocialSource", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
  });

  it("deletes the imported temporary video when provider analysis fails", async () => {
    mocks.createAnalysis.mockRejectedValue(new Error("Provider failed"));

    await expect(
      analyzeHookLabSocialSource({
        client: { mutation: vi.fn().mockResolvedValue(null) } as never,
        idea: {
          canonicalUrl: "https://www.instagram.com/reel/source/",
          id: "idea_1",
          sourcePlatform: "instagram",
          sourceType: "social_link",
        },
        job: {
          id: "provider_1",
          inputSnapshotJson: "{}",
          ownerId: "owner_1",
          stage: "running",
        },
        providerWorkerSecret: "provider-secret",
      }),
    ).rejects.toThrow("Provider failed");
    expect(mocks.deleteTemporaryVideo).toHaveBeenCalledWith({
      filePath: "/tmp/hook-lab-source.mp4",
    });
  });
});
