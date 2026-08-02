import { describe, expect, it } from "vitest";

import { InstagramFacebookProviderAdapter } from "../src/provider-runtime/instagram/InstagramFacebookProviderAdapter.js";
import { InstagramPublishingClient } from "../src/provider-runtime/instagram/InstagramPublishingClient.js";
import { InstagramStandaloneProviderAdapter } from "../src/provider-runtime/instagram/InstagramStandaloneProviderAdapter.js";
import { createMetaGraphVersion } from "../src/provider-runtime/instagram/createMetaGraphVersion.js";
import type { InstagramPublishRequest } from "../src/provider-runtime/instagram/InstagramPublishRequest.js";
import type { InstagramPublishCheckpoint } from "../src/provider-runtime/instagram/InstagramPublishCheckpoint.js";
import { FakeProviderHttpClient } from "./support/FakeProviderHttpClient.js";
import { providerResponse } from "./support/providerResponse.js";

const graphVersion = createMetaGraphVersion("v26.0");

const createPublishingClient = (
  responses: ConstructorParameters<typeof FakeProviderHttpClient>[0],
) => {
  const http = new FakeProviderHttpClient(responses);
  return {
    http,
    client: new InstagramPublishingClient({
      provider: "instagram",
      graphHost: "graph.facebook.com",
      graphVersion,
      http,
    }),
  };
};

const publishResponses = (containerIds: readonly string[]) => [
  providerResponse({
    data: [{ quota_usage: 1, config: { quota_total: 100, quota_duration: 86_400 } }],
  }),
  ...containerIds.flatMap((id) => [
    providerResponse({ id }),
    providerResponse({ status_code: "FINISHED" }),
  ]),
  providerResponse({ id: "post-123" }),
  providerResponse({ id: "post-123", permalink: "https://instagram.invalid/p/123" }),
];

const runInstagramPublish = async (
  client: InstagramPublishingClient,
  request: InstagramPublishRequest,
) => {
  let checkpoint: InstagramPublishCheckpoint | undefined;
  for (let step = 0; step < 20; step += 1) {
    const progress = await client.advancePublish(request, checkpoint);
    checkpoint = progress.checkpoint;
    if (
      progress.result.kind === "published" ||
      progress.result.kind === "outcome_unknown" ||
      progress.result.kind === "rejected"
    ) {
      return progress;
    }
  }
  throw new Error("Instagram test workflow did not terminate.");
};

describe("Instagram provider runtime", () => {
  it("publishes one image with encoded media parameters", async () => {
    const { client, http } = createPublishingClient(publishResponses(["container-1"]));
    const progress = await runInstagramPublish(client, {
      attemptKey: "attempt-single-0001",
      accountId: "ig-account",
      accessToken: "access-token-placeholder",
      caption: "A finished clip",
      placement: "feed",
      media: [
        {
          kind: "image",
          url: "https://media.clipstitchr.invalid/image.jpg?signature=a&part=b",
        },
      ],
    });

    expect(progress.result).toMatchObject({ kind: "published", remotePostIds: ["post-123"] });
    expect(http.requests[1]?.url).toContain("/v26.0/ig-account/media");
    const body = new URLSearchParams(http.requests[1]?.body);
    expect(body.get("image_url")).toBe(
      "https://media.clipstitchr.invalid/image.jpg?signature=a&part=b",
    );
    expect(body.get("caption")).toBe("A finished clip");
    expect(body.has("access_token")).toBe(false);
    expect(http.requests.every((request) => !request.url.includes("access-token-placeholder"))).toBe(true);
    expect(http.requests[1]?.headers?.["Authorization"]).toBe(
      "Bearer access-token-placeholder",
    );
  });

  it("creates child containers before a carousel parent", async () => {
    const responses = [
      providerResponse({
        data: [{ quota_usage: 1, config: { quota_total: 100, quota_duration: 86_400 } }],
      }),
      providerResponse({ id: "child-1" }),
      providerResponse({ status_code: "FINISHED" }),
      providerResponse({ id: "child-2" }),
      providerResponse({ status_code: "FINISHED" }),
      providerResponse({ id: "parent-1" }),
      providerResponse({ status_code: "FINISHED" }),
      providerResponse({ id: "post-carousel" }),
      providerResponse({ id: "post-carousel", permalink: "https://instagram.invalid/p/carousel" }),
    ];
    const { client, http } = createPublishingClient(responses);
    const progress = await runInstagramPublish(client, {
      attemptKey: "attempt-carousel-01",
      accountId: "ig-account",
      accessToken: "access-token-placeholder",
      caption: "Two frames",
      placement: "feed",
      media: [
        { kind: "image", url: "https://media.clipstitchr.invalid/one.jpg" },
        { kind: "image", url: "https://media.clipstitchr.invalid/two.jpg" },
      ],
    });
    const parentBody = new URLSearchParams(http.requests[5]?.body);
    expect(parentBody.get("media_type")).toBe("CAROUSEL");
    expect(parentBody.get("children")).toBe("child-1,child-2");
    expect(progress.checkpoint.childContainerIds).toEqual(["child-1", "child-2"]);
    expect(progress.checkpoint.parentContainerId).toBe("parent-1");
  });

  it("uses the reel media type for a single video", async () => {
    const { client, http } = createPublishingClient(publishResponses(["reel-container"]));
    const request: InstagramPublishRequest = {
      attemptKey: "attempt-reel-00001",
      accountId: "ig-account",
      accessToken: "access-token-placeholder",
      caption: "A reel",
      placement: "reel",
      media: [
        {
          kind: "video",
          url: "https://media.clipstitchr.invalid/reel.mp4",
          thumbnailOffsetMilliseconds: 2_000,
        },
      ],
    };
    await runInstagramPublish(client, request);
    const body = new URLSearchParams(http.requests[1]?.body);
    expect(body.get("media_type")).toBe("REELS");
    expect(body.get("thumb_offset")).toBe("2000");
  });

  it("stops at a bounded processing result instead of polling forever", async () => {
    const { client, http } = createPublishingClient([
      providerResponse({
        data: [{ quota_usage: 1, config: { quota_total: 100, quota_duration: 86_400 } }],
      }),
      providerResponse({ id: "container-pending" }),
      providerResponse({ status_code: "IN_PROGRESS" }),
    ]);
    const request: InstagramPublishRequest = {
        attemptKey: "attempt-pending-001",
        accountId: "ig-account",
        accessToken: "access-token-placeholder",
        caption: "Pending",
        placement: "feed",
        media: [{ kind: "image", url: "https://media.clipstitchr.invalid/pending.jpg" }],
      };
    const accepted = await client.advancePublish(request);
    await expect(
      client.advancePublish(request, accepted.checkpoint),
    ).resolves.toMatchObject({
      checkpoint: { childContainerIds: ["container-pending"] },
      result: { kind: "processing", providerOperationId: "container-pending" },
    });
    expect(http.requests).toHaveLength(3);
  });

  it("rejects an exhausted publishing quota before creating a container", async () => {
    const { client, http } = createPublishingClient([
      providerResponse({
        data: [{ quota_usage: 100, config: { quota_total: 100, quota_duration: 86_400 } }],
      }),
    ]);
    await expect(
      client.advancePublish({
        attemptKey: "attempt-quota-00001",
        accountId: "ig-account",
        accessToken: "access-token-placeholder",
        caption: "No quota",
        placement: "feed",
        media: [{ kind: "image", url: "https://media.clipstitchr.invalid/quota.jpg" }],
      }),
    ).rejects.toMatchObject({ code: "rate_limited" });
    expect(http.requests).toHaveLength(1);
    expect(http.requests[0]?.url).toContain("content_publishing_limit");
  });

  it("keeps a confirmed media ID published when permalink lookup fails", async () => {
    const { client, http } = createPublishingClient([
      providerResponse({
        data: [{ quota_usage: 1, config: { quota_total: 100, quota_duration: 86_400 } }],
      }),
      providerResponse({ id: "container-confirmed" }),
      providerResponse({ status_code: "FINISHED" }),
      providerResponse({ id: "post-confirmed" }),
      providerResponse({}, 503),
    ]);
    const request: InstagramPublishRequest = {
      attemptKey: "attempt-confirmed-01",
      accountId: "ig-account",
      accessToken: "access-token-placeholder",
      caption: "Confirmed",
      placement: "feed",
      media: [{ kind: "image", url: "https://media.clipstitchr.invalid/confirmed.jpg" }],
    };
    const progress = await runInstagramPublish(client, request);
    expect(progress.result).toMatchObject({
      kind: "published",
      remotePostIds: ["post-confirmed"],
      remoteUrls: [],
    });
    const requestCount = http.requests.length;
    await expect(
      client.advancePublish(request, progress.checkpoint),
    ).resolves.toMatchObject({ result: { kind: "published" } });
    expect(http.requests).toHaveLength(requestCount);
  });

  it("checkpoints an ambiguous child creation without dispatching it twice", async () => {
    const { client, http } = createPublishingClient([
      providerResponse({
        data: [{ quota_usage: 1, config: { quota_total: 100, quota_duration: 86_400 } }],
      }),
      providerResponse({}, 503),
    ]);
    const request: InstagramPublishRequest = {
      attemptKey: "attempt-unknown-0001",
      accountId: "ig-account",
      accessToken: "access-token-placeholder",
      caption: "Unknown",
      placement: "feed",
      media: [{ kind: "image", url: "https://media.clipstitchr.invalid/unknown.jpg" }],
    };
    const progress = await client.advancePublish(request);
    expect(progress).toMatchObject({
      checkpoint: { phase: "create_child_dispatched", childContainerIds: [] },
      result: { kind: "outcome_unknown" },
    });
    const requestCount = http.requests.length;
    await expect(
      client.advancePublish(request, progress.checkpoint),
    ).resolves.toMatchObject({ result: { kind: "outcome_unknown" } });
    expect(http.requests).toHaveLength(requestCount);
  });

  it("preserves retry-after from a Meta rate-limit envelope", async () => {
    const { client } = createPublishingClient([
      providerResponse(
        { error: { code: 4, message: "Rate limited" } },
        200,
        { "retry-after": "23" },
      ),
    ]);
    await expect(
      client.getPostAnalytics("post-1", "access-token-placeholder", ["views"]),
    ).rejects.toMatchObject({
      code: "rate_limited",
      retryAfterSeconds: 23,
    });
  });

  it("preserves unavailable analytics instead of synthesizing change", async () => {
    const { client } = createPublishingClient([
      providerResponse({
        data: [
          { name: "views", values: [{ value: 42 }] },
          { name: "shares", values: [] },
        ],
      }),
    ]);
    await expect(
      client.getPostAnalytics("post-1", "access-token-placeholder", ["views", "shares"]),
    ).resolves.toEqual([
      { name: "views", value: 42 },
      { name: "shares", value: undefined },
    ]);
    expect(client).toBeDefined();
  });

  it("builds state-bound Meta URLs and parses returned expirations", async () => {
    const http = new FakeProviderHttpClient([
      providerResponse({ access_token: "short-token" }),
      providerResponse({ access_token: "long-token", expires_in: 5_184_000 }),
      providerResponse({
        data: [
          { permission: "instagram_basic", status: "granted" },
          { permission: "instagram_content_publish", status: "granted" },
          { permission: "pages_read_engagement", status: "granted" },
          { permission: "pages_show_list", status: "granted" },
        ],
      }),
      providerResponse({ id: "fb-user", name: "ClipStitchr", picture: { data: {} } }),
    ]);
    const publishing = new InstagramPublishingClient({
      provider: "instagram",
      graphHost: "graph.facebook.com",
      graphVersion,
      http,
    });
    const adapter = new InstagramFacebookProviderAdapter({
      appId: "instagram-app",
      appSecret: "instagram-secret-placeholder",
      graphVersion,
      http,
      publishing,
    });
    const state = Buffer.alloc(32, 7).toString("base64url");
    const url = new URL(
      adapter.createAuthorizationUrl(
        state,
        "https://clipstitchr.invalid/api/publishing/oauth/instagram/callback",
      ),
    );
    expect(url.pathname).toContain("/v26.0/dialog/oauth");
    expect(url.searchParams.get("state")).toBe(state);
    await expect(
      adapter.exchangeAuthorizationCode(
        "authorization-code",
        "https://clipstitchr.invalid/api/publishing/oauth/instagram/callback",
      ),
    ).resolves.toMatchObject({ accessToken: "long-token", expiresInSeconds: 5_184_000 });
    expect(http.requests.slice(2).every((request) => !request.url.includes("long-token"))).toBe(true);
    expect(http.requests[2]?.headers?.["Authorization"]).toBe("Bearer long-token");
  });

  it("exchanges and refreshes standalone long-lived tokens", async () => {
    const http = new FakeProviderHttpClient([
      providerResponse({
        access_token: "short-token",
        permissions: ["instagram_business_basic", "instagram_business_content_publish"],
      }),
      providerResponse({ access_token: "long-token", expires_in: 5_184_000 }),
      providerResponse({ user_id: "ig-user", name: "ClipStitchr", username: "clipstitchr" }),
      providerResponse({ access_token: "rotated-token", expires_in: 5_184_000 }),
      providerResponse({ user_id: "ig-user", name: "ClipStitchr", username: "clipstitchr" }),
    ]);
    const publishing = new InstagramPublishingClient({
      provider: "instagram-standalone",
      graphHost: "graph.instagram.com",
      graphVersion,
      http,
    });
    const adapter = new InstagramStandaloneProviderAdapter({
      appId: "instagram-app",
      appSecret: "instagram-secret-placeholder",
      graphVersion,
      http,
      publishing,
    });
    await expect(
      adapter.exchangeAuthorizationCode(
        "authorization-code",
        "https://clipstitchr.invalid/api/publishing/oauth/instagram-standalone/callback",
      ),
    ).resolves.toMatchObject({ accessToken: "long-token", accountId: "ig-user" });
    await expect(adapter.refreshConnection("long-token")).resolves.toMatchObject({
      accessToken: "rotated-token",
      refreshToken: "rotated-token",
    });
    expect(
      http.requests.every(
        (request) =>
          !request.url.includes("short-token") &&
          !request.url.includes("long-token") &&
          !request.url.includes("rotated-token"),
      ),
    ).toBe(true);
    expect(http.requests[1]?.headers?.["Authorization"]).toBe("Bearer short-token");
    expect(http.requests[3]?.headers?.["Authorization"]).toBe("Bearer long-token");
  });
});
