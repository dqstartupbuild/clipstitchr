import { describe, expect, it } from "vitest";

import { ProviderRuntimeError } from "../src/provider-runtime/errors/ProviderRuntimeError.js";
import { TikTokProviderAdapter } from "../src/provider-runtime/tiktok/TikTokProviderAdapter.js";
import type { TikTokPublishRequest } from "../src/provider-runtime/tiktok/TikTokPublishRequest.js";
import { FakeProviderHttpClient } from "./support/FakeProviderHttpClient.js";
import { providerResponse } from "./support/providerResponse.js";

const NOW = 1_785_600_000_000;

const createAdapter = (
  responses: ConstructorParameters<typeof FakeProviderHttpClient>[0],
) => {
  const http = new FakeProviderHttpClient(responses);
  return {
    http,
    adapter: new TikTokProviderAdapter({
      clientId: "tiktok-client",
      clientSecret: "tiktok-secret-placeholder",
      http,
      verifiedMediaOrigin: "https://media.clipstitchr.invalid",
      verifyPullMediaUrl: async () => true,
      now: () => NOW,
    }),
  };
};

const creatorEnvelope = {
  data: {
    creator_username: "clipstitchr",
    creator_nickname: "ClipStitchr",
    privacy_level_options: ["SELF_ONLY", "PUBLIC_TO_EVERYONE"],
    comment_disabled: false,
    duet_disabled: true,
    stitch_disabled: false,
    max_video_post_duration_sec: 180,
  },
  error: { code: "ok", message: "", log_id: "log-creator" },
};

const directRequest = (creatorInfo: Awaited<ReturnType<TikTokProviderAdapter["getCreatorInfo"]>>): TikTokPublishRequest => ({
  accessToken: "access-token-placeholder",
  grantedScopes: ["video.publish"],
  mode: "direct",
  media: {
    kind: "video",
    urls: ["https://media.clipstitchr.invalid/video.mp4"],
    durationSeconds: 30,
  },
  caption: "A finished clip",
  photoTitle: undefined,
  privacyLevel: "SELF_ONLY",
  allowComment: true,
  allowDuet: false,
  allowStitch: true,
  isAigc: false,
  brandContent: false,
  brandOrganic: false,
  autoAddMusic: false,
  creatorInfo,
  consentConfirmed: true,
});

describe("TikTok provider runtime", () => {
  it("exchanges a confidential web code without a code_verifier", async () => {
    const { adapter, http } = createAdapter([
      providerResponse({
        access_token: "access-token-placeholder",
        refresh_token: "refresh-token-placeholder",
        expires_in: 86_400,
        refresh_expires_in: 31_536_000,
        scope: "user.info.basic,video.publish",
      }),
      providerResponse({
        data: {
          user: {
            open_id: "open-id",
            display_name: "ClipStitchr",
            username: "clipstitchr",
            avatar_url: "https://tiktok.invalid/avatar.jpg",
          },
        },
        error: { code: "ok" },
      }),
    ]);
    const connection = await adapter.exchangeAuthorizationCode(
      "authorization-code",
      "https://clipstitchr.invalid/api/studio/publishing/oauth/tiktok/callback",
    );
    const tokenBody = http.requests[0]?.body ?? "";

    expect(tokenBody).toContain("grant_type=authorization_code");
    expect(tokenBody).not.toContain("code_verifier");
    expect(connection.expiresInSeconds).toBe(86_400);
    expect(connection.refreshExpiresInSeconds).toBe(31_536_000);
  });

  it("requires current creator settings and explicit direct-post consent", async () => {
    const { adapter, http } = createAdapter([
      providerResponse(creatorEnvelope),
      providerResponse({
        data: { publish_id: "v_pub_url~direct" },
        error: { code: "ok" },
      }),
    ]);
    const creatorInfo = await adapter.getCreatorInfo("access-token-placeholder");
    const result = await adapter.publish(directRequest(creatorInfo));
    const initBody = JSON.parse(http.requests[1]?.body ?? "{}") as Record<string, unknown>;

    expect(result).toMatchObject({ kind: "accepted", providerOperationId: "v_pub_url~direct" });
    expect(initBody).toMatchObject({
      source_info: {
        source: "PULL_FROM_URL",
        video_url: "https://media.clipstitchr.invalid/video.mp4",
      },
      post_info: {
        privacy_level: "SELF_ONLY",
        disable_duet: true,
        disable_stitch: false,
      },
    });

    await expect(
      adapter.publish({ ...directRequest(creatorInfo), consentConfirmed: false }),
    ).rejects.toMatchObject({ code: "invalid_request" });
  });

  it("rejects foreign or unverified pull media before init", async () => {
    const { adapter, http } = createAdapter([]);
    const creatorInfo = {
      fetchedAtEpochMilliseconds: NOW,
      username: "clipstitchr",
      nickname: "ClipStitchr",
      privacyLevelOptions: ["SELF_ONLY"],
      commentsDisabled: false,
      duetDisabled: false,
      stitchDisabled: false,
      maxVideoDurationSeconds: 180,
    } as const;
    await expect(
      adapter.publish({
        ...directRequest(creatorInfo),
        media: {
          kind: "video",
          urls: ["https://attacker.invalid/video.mp4"],
          durationSeconds: 30,
        },
      }),
    ).rejects.toMatchObject({ code: "invalid_request" });
    expect(http.requests).toHaveLength(0);

    const rejectingHttp = new FakeProviderHttpClient([]);
    const rejectingAdapter = new TikTokProviderAdapter({
      clientId: "tiktok-client",
      clientSecret: "tiktok-secret-placeholder",
      http: rejectingHttp,
      verifiedMediaOrigin: "https://media.clipstitchr.invalid",
      verifyPullMediaUrl: async () => false,
      now: () => NOW,
    });
    await expect(
      rejectingAdapter.publish(directRequest(creatorInfo)),
    ).rejects.toMatchObject({ code: "invalid_request" });
    expect(rejectingHttp.requests).toHaveLength(0);
  });

  it("maps an ambiguous init response to outcome_unknown without auto-retry", async () => {
    const { adapter, http } = createAdapter([
      providerResponse({}, 503),
    ]);
    const creatorInfo = {
      fetchedAtEpochMilliseconds: NOW,
      username: "clipstitchr",
      nickname: "ClipStitchr",
      privacyLevelOptions: ["SELF_ONLY"],
      commentsDisabled: false,
      duetDisabled: false,
      stitchDisabled: false,
      maxVideoDurationSeconds: 180,
    } as const;
    await expect(adapter.publish(directRequest(creatorInfo))).resolves.toMatchObject({
      kind: "outcome_unknown",
      providerOperationId: undefined,
    });
    expect(http.requests).toHaveLength(1);
  });

  it.each([
    ["PROCESSING_UPLOAD", "media_transfer_pending", undefined],
    ["PROCESSING_DOWNLOAD", "media_transfer_pending", undefined],
    ["SEND_TO_USER_INBOX", "requires_user_action", undefined],
    ["PUBLISH_COMPLETE", "published_not_public", undefined],
    ["PUBLISH_COMPLETE", "published", ["post-123"]],
    ["FAILED", "rejected", undefined],
  ] as const)("maps %s to %s", async (status, kind, publicIds) => {
    const { adapter } = createAdapter([
      providerResponse({
        data: {
          status,
          ...(publicIds === undefined
            ? {}
            : { publicaly_available_post_id: publicIds }),
        },
        error: { code: "ok" },
      }),
    ]);
    await expect(
      adapter.getPostStatus("access-token-placeholder", "publish-123"),
    ).resolves.toMatchObject({ kind });
  });

  it("parses analytics without inventing missing values", async () => {
    const { adapter } = createAdapter([
      providerResponse({
        data: { videos: [{ id: "post-1", view_count: 10, like_count: 2 }] },
        error: { code: "ok" },
      }),
    ]);
    await expect(
      adapter.getPostAnalytics("access-token-placeholder", "post-1"),
    ).resolves.toEqual([
      { name: "Views", value: 10 },
      { name: "Likes", value: 2 },
      { name: "Comments", value: undefined },
      { name: "Shares", value: undefined },
    ]);
  });

  it("redacts raw provider payloads from errors", async () => {
    const leaked = "sensitive-provider-token";
    const { adapter } = createAdapter([
      providerResponse({
        data: {},
        error: { code: "access_token_invalid", message: leaked },
      }),
    ]);
    try {
      await adapter.getPostStatus("access-token-placeholder", "publish-123");
      throw new Error("Expected provider error.");
    } catch (error) {
      expect(error).toBeInstanceOf(ProviderRuntimeError);
      expect((error as Error).message).not.toContain(leaked);
    }
  });

  it("preserves retry-after for a rate-limited success envelope", async () => {
    const { adapter } = createAdapter([
      providerResponse(
        { data: {}, error: { code: "rate_limit_exceeded" } },
        200,
        { "retry-after": "17" },
      ),
    ]);
    await expect(
      adapter.getPostStatus("access-token-placeholder", "publish-123"),
    ).rejects.toMatchObject({
      code: "rate_limited",
      retryAfterSeconds: 17,
    });
  });
});
