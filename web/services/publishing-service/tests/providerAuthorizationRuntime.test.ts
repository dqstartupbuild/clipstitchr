import { describe, expect, it } from "vitest";

import { resolveClerkTenantIdentity } from "../src/identity/resolveClerkTenantIdentity.js";
import { RedisOAuthAuthorizationStateStore } from "../src/oauth/RedisOAuthAuthorizationStateStore.js";
import { createProviderAuthorizationRequest } from "../src/provider-runtime/oauth/createProviderAuthorizationRequest.js";
import { TikTokProviderAdapter } from "../src/provider-runtime/tiktok/TikTokProviderAdapter.js";
import { YouTubeProviderAdapter } from "../src/provider-runtime/youtube/YouTubeProviderAdapter.js";
import type { YouTubeUploadTransport } from "../src/provider-runtime/youtube/YouTubeUploadTransport.js";
import { consumeOAuthAuthorizationRequestState } from "../src/oauth/consumeOAuthAuthorizationRequestState.js";
import { createRedisSecurityNamespace } from "../src/redis/createRedisSecurityNamespace.js";
import { FakeProviderHttpClient } from "./support/FakeProviderHttpClient.js";
import { InMemoryRedisStringCommands } from "./support/InMemoryRedisStringCommands.js";

describe("provider authorization runtime", () => {
  it("uses the service-issued state and omits PKCE from TikTok web auth", async () => {
    const now = 1_785_600_000_000;
    const commands = new InMemoryRedisStringCommands(() => now);
    const store = new RedisOAuthAuthorizationStateStore(
      commands,
      createRedisSecurityNamespace("test"),
    );
    const runtime = new TikTokProviderAdapter({
      clientId: "tiktok-client",
      clientSecret: "tiktok-secret-placeholder",
      http: new FakeProviderHttpClient([]),
      verifiedMediaOrigin: "https://media.clipstitchr.invalid",
      verifyPullMediaUrl: async () => true,
      now: () => now,
    });
    const request = await createProviderAuthorizationRequest({
      identity: resolveClerkTenantIdentity({ actorUserId: "user_test_123" }),
      runtime,
      publicOrigin: "https://clipstitchr.invalid",
      returnPath: "/dashboard/studio/publishing/integrations",
      store,
      nowEpochMilliseconds: now,
    });
    const url = new URL(request.authorizationUrl);

    expect(url.searchParams.get("state")).toBe(request.state);
    expect(Buffer.from(request.state, "base64url")).toHaveLength(32);
    expect(url.searchParams.has("code_challenge")).toBe(false);
    expect(url.searchParams.has("code_challenge_method")).toBe(false);
    expect(request.pkceMode).toBe("none");
  });

  it("issues single-use S256 state for the provider-bound YouTube flow", async () => {
    const now = 1_785_600_000_000;
    const commands = new InMemoryRedisStringCommands(() => now);
    const store = new RedisOAuthAuthorizationStateStore(
      commands,
      createRedisSecurityNamespace("test-youtube"),
    );
    const unavailableUpload = {
      initiate: async () => {
        throw new Error("not used");
      },
      probe: async () => {
        throw new Error("not used");
      },
      uploadRange: async () => {
        throw new Error("not used");
      },
      uploadThumbnail: async () => {
        throw new Error("not used");
      },
    } as YouTubeUploadTransport;
    const runtime = new YouTubeProviderAdapter({
      clientId: "google-client",
      clientSecret: "google-client-secret",
      http: new FakeProviderHttpClient([]),
      upload: unavailableUpload,
    });
    const identity = resolveClerkTenantIdentity({
      actorUserId: "user_youtube_123",
    });
    const request = await createProviderAuthorizationRequest({
      identity,
      runtime,
      publicOrigin: "https://clipstitchr.invalid",
      returnPath: "/dashboard/studio/publishing/integrations",
      store,
      nowEpochMilliseconds: now,
    });
    const url = new URL(request.authorizationUrl);
    expect(request.pkceMode).toBe("rfc7636-s256");
    expect(url.searchParams.get("code_challenge")).toBe(
      request.pkceMode === "rfc7636-s256" ? request.codeChallenge : null,
    );
    const consumed = await consumeOAuthAuthorizationRequestState({
      state: request.state,
      expectedIdentity: identity,
      expectedProvider: "youtube",
      expectedPkceMode: "rfc7636-s256",
      expectedPublicOrigin: "https://clipstitchr.invalid",
      expectedReturnPath: "/dashboard/studio/publishing/integrations",
      store,
      nowEpochMilliseconds: now + 1,
    });
    expect(consumed).toMatchObject({
      provider: "youtube",
      pkceMode: "rfc7636-s256",
      codeVerifier: expect.stringMatching(/^[A-Za-z0-9_-]{43}$/u),
    });
    await expect(
      consumeOAuthAuthorizationRequestState({
        state: request.state,
        expectedIdentity: identity,
        expectedProvider: "youtube",
        expectedPkceMode: "rfc7636-s256",
        expectedPublicOrigin: "https://clipstitchr.invalid",
        expectedReturnPath: "/dashboard/studio/publishing/integrations",
        store,
        nowEpochMilliseconds: now + 2,
      }),
    ).rejects.toMatchObject({ reason: "unavailable" });
  });
});
