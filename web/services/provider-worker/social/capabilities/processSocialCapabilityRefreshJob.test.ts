import { beforeEach, describe, expect, it, vi } from "vitest";
import { processSocialCapabilityRefreshJob } from "./processSocialCapabilityRefreshJob";

const mocks = vi.hoisted(() => ({
  getValidSocialAccessToken: vi.fn(),
  markSocialProviderJobCompleted: vi.fn(),
  queryTikTokCreatorInfo: vi.fn(),
}));

vi.mock("../getValidSocialAccessToken", () => ({
  getValidSocialAccessToken: mocks.getValidSocialAccessToken,
}));
vi.mock("../markSocialProviderJobCompleted", () => ({
  markSocialProviderJobCompleted: mocks.markSocialProviderJobCompleted,
}));
vi.mock("../tiktok/queryTikTokCreatorInfo", () => ({
  queryTikTokCreatorInfo: mocks.queryTikTokCreatorInfo,
}));

describe("processSocialCapabilityRefreshJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getValidSocialAccessToken.mockResolvedValue("access_token");
    mocks.queryTikTokCreatorInfo.mockResolvedValue({
      creator_nickname: "Creator",
      privacy_level_options: ["SELF_ONLY"],
    });
  });

  it("verifies a TikTok account that was previously marked needs attention", async () => {
    const account = {
      id: "account_1",
      ownerId: "owner_1",
      platform: "tiktok",
      status: "needs_attention",
    };
    const query = vi.fn().mockResolvedValue(account);
    const mutation = vi.fn().mockResolvedValue(undefined);
    const job = {
      id: "job_1",
      inputSnapshotJson: JSON.stringify({ accountId: "account_1" }),
      jobType: "social-capability-refresh",
      ownerId: "owner_1",
    };

    await processSocialCapabilityRefreshJob({
      client: { mutation, query } as never,
      job: job as never,
      providerWorkerSecret: "worker",
    });

    expect(mocks.getValidSocialAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({ account }),
    );
    expect(mutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ id: "account_1" }),
    );
    expect(mocks.markSocialProviderJobCompleted).toHaveBeenCalledWith(
      expect.objectContaining({ stage: "capabilities-refreshed" }),
    );
  });
});
