import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createInstagramSource: vi.fn(),
  getDatasetItems: vi.fn(),
  getRun: vi.fn(),
  markStatus: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/apify/getApifyActorRun", () => ({
  getApifyActorRun: mocks.getRun,
}));
vi.mock("@/lib/clipstitchr/server/apify/getApifyDatasetItems", () => ({
  getApifyDatasetItems: mocks.getDatasetItems,
}));
vi.mock("@/lib/clipstitchr/server/hookLab/createHookLabInstagramSource", () => ({
  createHookLabInstagramSource: mocks.createInstagramSource,
}));
vi.mock("./markHookLabAnalysisJobStatus", () => ({
  markHookLabAnalysisJobStatus: mocks.markStatus,
}));

import { loadHookLabSocialSource } from "./loadHookLabSocialSource";

const input = {
  client: { mutation: vi.fn().mockResolvedValue(null) } as never,
  idea: {
    canonicalUrl: "https://www.instagram.com/reel/source/",
    id: "idea_1",
    providerRunId: "run_1",
    sourcePlatform: "instagram" as const,
    sourceType: "social_link",
  },
  job: {
    id: "provider_1",
    inputSnapshotJson: JSON.stringify({ ideaId: "idea_1" }),
    ownerId: "owner_1",
    stage: "running",
  },
  providerWorkerSecret: "provider-secret",
};

describe("loadHookLabSocialSource", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("attaches a reused terminal Actor run to the current provider job", async () => {
    const source = {
      canonicalUrl: "https://www.instagram.com/reel/source/",
      platform: "instagram",
      temporaryVideoUrl: "https://cdn.example.com/source.mp4",
    };
    mocks.getRun.mockResolvedValue({
      defaultDatasetId: "dataset_1",
      id: "run_1",
      status: "SUCCEEDED",
    });
    mocks.getDatasetItems.mockResolvedValue([{ id: "post_1" }]);
    mocks.createInstagramSource.mockReturnValue(source);

    await expect(loadHookLabSocialSource(input)).resolves.toEqual(source);
    expect(mocks.markStatus).toHaveBeenCalledWith({
      client: input.client,
      job: input.job,
      progress: 0.2,
      providerJobId: "run_1",
      providerWorkerSecret: "provider-secret",
      stage: "hook-lab-reading-apify-result",
      status: "running",
    });
  });

  it("attaches a reused failed Actor run before reporting its failure", async () => {
    mocks.getRun.mockResolvedValue({ id: "run_1", status: "FAILED" });

    await expect(loadHookLabSocialSource(input)).rejects.toThrow(
      "instagram import did not complete.",
    );
    expect(mocks.markStatus).toHaveBeenCalledWith(
      expect.objectContaining({ providerJobId: "run_1" }),
    );
    expect(mocks.getDatasetItems).not.toHaveBeenCalled();
  });
});
