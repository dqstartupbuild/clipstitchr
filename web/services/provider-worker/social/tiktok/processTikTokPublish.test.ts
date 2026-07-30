import { beforeEach, describe, expect, it, vi } from "vitest";
import { SocialOutcomeUnknownError } from "../SocialOutcomeUnknownError";
import { processTikTokPublish } from "./processTikTokPublish";

const mocks = vi.hoisted(() => ({
  initializeTikTokPublish: vi.fn(),
  queryTikTokCreatorInfo: vi.fn(),
  waitForTikTokPublishStatus: vi.fn(),
}));

vi.mock("./initializeTikTokPublish", () => ({
  initializeTikTokPublish: mocks.initializeTikTokPublish,
}));
vi.mock("./queryTikTokCreatorInfo", () => ({
  queryTikTokCreatorInfo: mocks.queryTikTokCreatorInfo,
}));
vi.mock("./waitForTikTokPublishStatus", () => ({
  waitForTikTokPublishStatus: mocks.waitForTikTokPublishStatus,
}));

describe("processTikTokPublish", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.queryTikTokCreatorInfo.mockResolvedValue({
      creator_nickname: "Creator",
      privacy_level_options: ["SELF_ONLY"],
      comment_disabled: false,
      duet_disabled: false,
      stitch_disabled: false,
      max_video_post_duration_sec: 180,
    });
    mocks.waitForTikTokPublishStatus.mockResolvedValue({
      publicly_available_post_id: ["public_1"],
      status: "PUBLISH_COMPLETE",
    });
  });

  it("does not repeat an ambiguous provider initialization", async () => {
    await expect(
      processTikTokPublish({
        accessToken: "token",
        attemptId: "attempt_1",
        client: { query: vi.fn(), mutation: vi.fn() } as never,
        document: {
          account: {
            accessTokenCiphertext: "cipher",
            externalAccountId: "tt_account",
            id: "account_1",
            ownerId: "owner_1",
            platform: "tiktok",
            tokenEncryptionVersion: 1,
            username: "creator",
          },
          assets: [
            {
              contentType: "video/mp4",
              durationSeconds: 30,
              id: "asset_1",
              kind: "video",
              objectKey: "owner/video.mp4",
              order: 0,
              sizeBytes: 100,
            },
          ],
          attempts: [
            {
              id: "attempt_1",
              retrySafety: "do_not_retry_reconcile_only",
              stage: "provider_initialization_requested",
              status: "running",
            },
          ],
          post: {
            caption: "Caption",
            id: "post_1",
            ownerId: "owner_1",
            productId: "product_1",
            title: "Title",
          },
          publications: [],
          target: {
            controlsJson: JSON.stringify({
              allowComment: false,
              allowDuet: false,
              allowStitch: false,
              autoAddMusic: false,
              brandContentToggle: false,
              brandOrganicToggle: false,
              consentAcknowledged: true,
              privacyLevel: "SELF_ONLY",
            }),
            id: "target_1",
            platform: "tiktok",
            postId: "post_1",
            publishMode: "direct",
            socialAccountId: "account_1",
            status: "publishing",
          },
        },
        mediaUrls: ["https://media.example.com/video"],
        providerWorkerSecret: "worker",
      }),
    ).rejects.toBeInstanceOf(SocialOutcomeUnknownError);
    expect(mocks.initializeTikTokPublish).not.toHaveBeenCalled();
  });

  it("reconciles an accepted publish without revalidating old controls", async () => {
    const result = await processTikTokPublish({
      accessToken: "token",
      attemptId: "attempt_1",
      client: { query: vi.fn(), mutation: vi.fn() } as never,
      document: {
        account: {
          accessTokenCiphertext: "cipher",
          externalAccountId: "tt_account",
          id: "account_1",
          ownerId: "owner_1",
          platform: "tiktok",
          tokenEncryptionVersion: 1,
          username: "creator",
        },
        assets: [
          {
            contentType: "video/mp4",
            durationSeconds: 30,
            id: "asset_1",
            kind: "video",
            objectKey: "owner/video.mp4",
            order: 0,
            sizeBytes: 100,
          },
        ],
        attempts: [
          {
            id: "attempt_1",
            providerPublishId: "publish_1",
            stage: "provider_accepted",
            status: "running",
          },
        ],
        post: {
          caption: "Caption",
          id: "post_1",
          ownerId: "owner_1",
          productId: "product_1",
          title: "Title",
        },
        publications: [],
        target: {
          controlsJson: JSON.stringify({
            allowComment: false,
            allowDuet: false,
            allowStitch: false,
            autoAddMusic: false,
            brandContentToggle: false,
            brandOrganicToggle: false,
            consentAcknowledged: true,
            privacyLevel: "SELF_ONLY",
          }),
          id: "target_1",
          platform: "tiktok",
          postId: "post_1",
          publishMode: "direct",
          socialAccountId: "account_1",
          status: "status_check",
        },
      },
      mediaUrls: [],
      providerWorkerSecret: "worker",
    });

    expect(mocks.queryTikTokCreatorInfo).not.toHaveBeenCalled();
    expect(mocks.initializeTikTokPublish).not.toHaveBeenCalled();
    expect(mocks.waitForTikTokPublishStatus).toHaveBeenCalledWith(
      "token",
      "publish_1",
    );
    expect(result).toMatchObject({
      state: "published",
      publicationIds: ["public_1"],
    });
  });
});
