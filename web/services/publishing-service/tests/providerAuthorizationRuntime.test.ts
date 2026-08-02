import { describe, expect, it } from "vitest";

import { resolveClerkTenantIdentity } from "../src/identity/resolveClerkTenantIdentity.js";
import { RedisOAuthAuthorizationStateStore } from "../src/oauth/RedisOAuthAuthorizationStateStore.js";
import { createProviderAuthorizationRequest } from "../src/provider-runtime/oauth/createProviderAuthorizationRequest.js";
import { TikTokProviderAdapter } from "../src/provider-runtime/tiktok/TikTokProviderAdapter.js";
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
      returnPath: "/dashboard/publishing/integrations",
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
});
