import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  analyzeOwned: vi.fn(),
  analyzeSocial: vi.fn(),
  markStatus: vi.fn(),
}));

vi.mock("./analyzeHookLabOwnedSource", () => ({
  analyzeHookLabOwnedSource: mocks.analyzeOwned,
}));
vi.mock("./analyzeHookLabSocialSource", () => ({
  analyzeHookLabSocialSource: mocks.analyzeSocial,
}));
vi.mock("./markHookLabAnalysisJobStatus", () => ({
  markHookLabAnalysisJobStatus: mocks.markStatus,
}));

import { processHookLabIdeaAnalysis } from "./processHookLabIdeaAnalysis";

describe("processHookLabIdeaAnalysis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("leaves completion untouched when an asynchronous social import continues", async () => {
    const client = {
      mutation: vi.fn(),
      query: vi.fn(async () => ({
        idea: {
          canonicalUrl: "https://www.instagram.com/reel/source/",
          id: "idea_1",
          sourcePlatform: "instagram",
          sourceType: "social_link",
        },
      })),
    };
    mocks.analyzeSocial.mockResolvedValue(null);

    await processHookLabIdeaAnalysis({
      client: client as never,
      job: {
        id: "provider_1",
        inputSnapshotJson: JSON.stringify({ ideaId: "idea_1" }),
        ownerId: "owner_1",
        stage: "hook-lab-awaiting-apify",
      },
      providerWorkerSecret: "provider-secret",
    });

    expect(mocks.analyzeSocial).toHaveBeenCalledOnce();
    expect(mocks.analyzeOwned).not.toHaveBeenCalled();
    expect(client.mutation).not.toHaveBeenCalled();
    expect(mocks.markStatus).not.toHaveBeenCalled();
  });
});
