import { setTimeout as wait } from "node:timers/promises";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { RedisServiceAssertionReplayProtector } from "../../src/assertions/RedisServiceAssertionReplayProtector.js";
import { resolveClerkTenantIdentity } from "../../src/identity/resolveClerkTenantIdentity.js";
import { RedisOAuthAuthorizationStateStore } from "../../src/oauth/RedisOAuthAuthorizationStateStore.js";
import { RedisPublishingRateLimiter } from "../../src/rate-limits/RedisPublishingRateLimiter.js";
import type { PublishingRateLimitPolicies } from "../../src/rate-limits/PublishingRateLimitPolicies.js";
import type { RedisOAuthAuthorizationStateCommands } from "../../src/redis/RedisOAuthAuthorizationStateCommands.js";
import type { IoredisPublishingRedisRuntime } from "../../src/redis/IoredisPublishingRedisRuntime.js";
import { createIoredisPublishingRedisRuntime } from "../../src/redis/createIoredisPublishingRedisRuntime.js";
import { createEphemeralRedisNamespace } from "../support/createEphemeralRedisNamespace.js";
import { readEphemeralRedisTestUrl } from "../support/readEphemeralRedisTestUrl.js";

const REPLAY_KEY = `service-assertion:v1:${"A".repeat(43)}`;
const OAUTH_STORAGE_KEY = `oauth-authorization-state:v1:${"B".repeat(43)}`;
const WINDOW_MILLISECONDS = 60_000;
const quota = {
  global: { limit: 3, windowMilliseconds: WINDOW_MILLISECONDS },
  tenant: { limit: 2, windowMilliseconds: WINDOW_MILLISECONDS },
};
const policies: PublishingRateLimitPolicies = {
  "integration.read": quota,
  "oauth.initiate": quota,
  "oauth.callback": quota,
  "integration.refresh": quota,
  "integration.disconnect": quota,
  "media.register": quota,
  "media.fetch-url": quota,
  "draft.write": quota,
  "publish.create": quota,
  "schedule.create": quota,
  "publish.retry": quota,
  "publish.cancel": quota,
  "analytics.refresh": quota,
  "status.poll": quota,
  "webhook.process": quota,
  "provider.paid-work": quota,
};

describe("ioredis publishing security integration", () => {
  let runtime: IoredisPublishingRedisRuntime;

  beforeAll(async () => {
    runtime = createIoredisPublishingRedisRuntime(readEphemeralRedisTestUrl());
    await runtime.connect();
    await runtime.assertReady();
  });

  afterAll(async () => {
    await runtime.close();
  });

  it("enforces atomic NX with PX expiry for assertion replay keys", async () => {
    const protector = new RedisServiceAssertionReplayProtector(
      runtime.commands,
      createEphemeralRedisNamespace("replay"),
    );
    const expiresAtEpochMilliseconds = Date.now() + 300;

    const concurrentResults = await Promise.all([
      protector.consume(REPLAY_KEY, expiresAtEpochMilliseconds),
      protector.consume(REPLAY_KEY, expiresAtEpochMilliseconds),
    ]);

    expect(concurrentResults.filter(Boolean)).toHaveLength(1);
    await wait(400);
    await expect(
      protector.consume(REPLAY_KEY, Date.now() + 300),
    ).resolves.toBe(true);
  });

  it("atomically consumes OAuth state through GETDEL", async () => {
    const store = new RedisOAuthAuthorizationStateStore(
      runtime.commands,
      createEphemeralRedisNamespace("getdel"),
    );

    await expect(store.create(OAUTH_STORAGE_KEY, "getdel-value", 5_000)).resolves.toBe(
      true,
    );
    const results = await Promise.all([
      store.consume(OAUTH_STORAGE_KEY),
      store.consume(OAUTH_STORAGE_KEY),
    ]);

    expect(results.filter((value) => value === "getdel-value")).toHaveLength(1);
    expect(results.filter((value) => value === null)).toHaveLength(1);
  });

  it("atomically consumes OAuth state through the compare-and-delete Lua fallback", async () => {
    const fallbackCommands: RedisOAuthAuthorizationStateCommands = {
      set: runtime.commands.set.bind(runtime.commands),
      get: runtime.commands.get.bind(runtime.commands),
      eval: runtime.commands.eval.bind(runtime.commands),
    };
    const store = new RedisOAuthAuthorizationStateStore(
      fallbackCommands,
      createEphemeralRedisNamespace("lua"),
    );

    await expect(store.create(OAUTH_STORAGE_KEY, "lua-value", 5_000)).resolves.toBe(
      true,
    );
    const results = await Promise.all([
      store.consume(OAUTH_STORAGE_KEY),
      store.consume(OAUTH_STORAGE_KEY),
    ]);

    expect(results.filter((value) => value === "lua-value")).toHaveLength(1);
    expect(results.filter((value) => value === null)).toHaveLength(1);
  });

  it("applies tenant and global rate limits in one Redis Lua decision", async () => {
    const limiter = new RedisPublishingRateLimiter(
      runtime.commands,
      policies,
      createEphemeralRedisNamespace("limits"),
    );
    const alpha = resolveClerkTenantIdentity({ actorUserId: "user_alpha" }).tenantKey;
    const beta = resolveClerkTenantIdentity({ actorUserId: "user_beta" }).tenantKey;
    const gamma = resolveClerkTenantIdentity({ actorUserId: "user_gamma" }).tenantKey;

    await expect(
      limiter.consume({ action: "oauth.initiate", tenantKey: alpha }),
    ).resolves.toMatchObject({ allowed: true, global: { remaining: 2 }, tenant: { remaining: 1 } });
    await expect(
      limiter.consume({ action: "oauth.initiate", tenantKey: alpha }),
    ).resolves.toMatchObject({ allowed: true, global: { remaining: 1 }, tenant: { remaining: 0 } });
    await expect(
      limiter.consume({ action: "oauth.initiate", tenantKey: alpha }),
    ).resolves.toMatchObject({ allowed: false, global: { remaining: 1 }, tenant: { remaining: 0 } });
    await expect(
      limiter.consume({ action: "oauth.initiate", tenantKey: beta }),
    ).resolves.toMatchObject({ allowed: true, global: { remaining: 0 } });
    await expect(
      limiter.consume({ action: "oauth.initiate", tenantKey: gamma }),
    ).resolves.toMatchObject({ allowed: false, global: { remaining: 0 } });
  });

  it("isolates identical security keys by deployment namespace", async () => {
    const first = new RedisOAuthAuthorizationStateStore(
      runtime.commands,
      createEphemeralRedisNamespace("namespace-a"),
    );
    const second = new RedisOAuthAuthorizationStateStore(
      runtime.commands,
      createEphemeralRedisNamespace("namespace-b"),
    );

    await expect(first.create(OAUTH_STORAGE_KEY, "first", 5_000)).resolves.toBe(true);
    await expect(second.create(OAUTH_STORAGE_KEY, "second", 5_000)).resolves.toBe(true);
    await expect(first.consume(OAUTH_STORAGE_KEY)).resolves.toBe("first");
    await expect(second.consume(OAUTH_STORAGE_KEY)).resolves.toBe("second");
  });
});
