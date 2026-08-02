import { describe, expect, it } from "vitest";

import { PublishingRateLimitExceededError } from "../src/errors/PublishingRateLimitExceededError.js";
import { PublishingRateLimitStorageError } from "../src/errors/PublishingRateLimitStorageError.js";
import { resolveClerkTenantIdentity } from "../src/identity/resolveClerkTenantIdentity.js";
import { RedisPublishingRateLimiter } from "../src/rate-limits/RedisPublishingRateLimiter.js";
import type { PublishingRateLimitPolicies } from "../src/rate-limits/PublishingRateLimitPolicies.js";
import { enforcePublishingRateLimit } from "../src/rate-limits/enforcePublishingRateLimit.js";
import { InMemoryRateLimitScriptCommands } from "./support/InMemoryRateLimitScriptCommands.js";
import { createRedisSecurityNamespace } from "../src/redis/createRedisSecurityNamespace.js";

const NOW = 1_785_600_000_000;
const WINDOW = 60_000;
const NAMESPACE = createRedisSecurityNamespace("production");
const quota = {
  global: { limit: 3, windowMilliseconds: WINDOW },
  tenant: { limit: 2, windowMilliseconds: WINDOW },
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

const tenant = (id: string) =>
  resolveClerkTenantIdentity({ actorUserId: `user_${id}` }).tenantKey;

describe("publishing rate limits", () => {
  it("atomically gates tenant and global quotas before work", async () => {
    const commands = new InMemoryRateLimitScriptCommands(NOW);
    const limiter = new RedisPublishingRateLimiter(commands, policies, NAMESPACE);

    await expect(
      limiter.consume({ action: "oauth.initiate", tenantKey: tenant("alpha") }),
    ).resolves.toMatchObject({ allowed: true, global: { remaining: 2 }, tenant: { remaining: 1 } });
    await expect(
      limiter.consume({ action: "oauth.initiate", tenantKey: tenant("alpha") }),
    ).resolves.toMatchObject({ allowed: true, global: { remaining: 1 }, tenant: { remaining: 0 } });

    const tenantDenial = await limiter.consume({
      action: "oauth.initiate",
      tenantKey: tenant("alpha"),
    });

    expect(tenantDenial).toMatchObject({
      allowed: false,
      retryAfterSeconds: 60,
      global: { remaining: 1 },
      tenant: { remaining: 0 },
    });

    await expect(
      limiter.consume({ action: "oauth.initiate", tenantKey: tenant("beta") }),
    ).resolves.toMatchObject({ allowed: true, global: { remaining: 0 } });
    await expect(
      limiter.consume({ action: "oauth.initiate", tenantKey: tenant("gamma") }),
    ).resolves.toMatchObject({
      allowed: false,
      global: { remaining: 0 },
      tenant: { remaining: 2 },
    });
  });

  it("uses one Lua invocation and cluster-compatible opaque keys for both scopes", async () => {
    const commands = new InMemoryRateLimitScriptCommands(NOW);
    const limiter = new RedisPublishingRateLimiter(commands, policies, NAMESPACE);
    const clerkTenantKey = tenant("private_identity");

    await limiter.consume({
      action: "provider.paid-work",
      tenantKey: clerkTenantKey,
      cost: 2,
    });

    expect(commands.evalCalls).toHaveLength(1);
    expect(commands.evalCalls[0]?.script).toContain('redis.call("TIME")');
    expect(commands.evalCalls[0]?.script).toContain('redis.call("HSET"');
    expect(commands.evalCalls[0]?.script).toContain('redis.call("PEXPIREAT"');
    expect(commands.evalCalls[0]?.keys).toHaveLength(2);
    expect(commands.evalCalls[0]?.keys[0]).toContain(
      "{clipstitchr-publishing-rate-limit:production:v1}",
    );
    expect(commands.evalCalls[0]?.keys[1]).toContain(
      "{clipstitchr-publishing-rate-limit:production:v1}",
    );
    expect(commands.evalCalls[0]?.keys.join(" ")).not.toContain(clerkTenantKey);
  });

  it("allows only one concurrent request when the global quota has one slot", async () => {
    const commands = new InMemoryRateLimitScriptCommands(NOW);
    const singleSlotPolicies: PublishingRateLimitPolicies = {
      ...policies,
      "oauth.initiate": {
        global: { limit: 1, windowMilliseconds: WINDOW },
        tenant: { limit: 1, windowMilliseconds: WINDOW },
      },
    };
    const limiter = new RedisPublishingRateLimiter(
      commands,
      singleSlotPolicies,
      NAMESPACE,
    );
    const decisions = await Promise.all([
      limiter.consume({ action: "oauth.initiate", tenantKey: tenant("alpha") }),
      limiter.consume({ action: "oauth.initiate", tenantKey: tenant("beta") }),
    ]);

    expect(decisions.filter(({ allowed }) => allowed)).toHaveLength(1);
    expect(decisions.filter(({ allowed }) => !allowed)).toHaveLength(1);
  });

  it("isolates identical quotas by deployment namespace", async () => {
    const commands = new InMemoryRateLimitScriptCommands(NOW);
    const oneSlotPolicies: PublishingRateLimitPolicies = {
      ...policies,
      "oauth.initiate": {
        global: { limit: 1, windowMilliseconds: WINDOW },
        tenant: { limit: 1, windowMilliseconds: WINDOW },
      },
    };
    const production = new RedisPublishingRateLimiter(
      commands,
      oneSlotPolicies,
      createRedisSecurityNamespace("production"),
    );
    const staging = new RedisPublishingRateLimiter(
      commands,
      oneSlotPolicies,
      createRedisSecurityNamespace("staging"),
    );
    const request = {
      action: "oauth.initiate" as const,
      tenantKey: tenant("alpha"),
    };

    await expect(production.consume(request)).resolves.toMatchObject({ allowed: true });
    await expect(staging.consume(request)).resolves.toMatchObject({ allowed: true });
    expect(commands.evalCalls[0]?.keys[0]).not.toBe(commands.evalCalls[1]?.keys[0]);
  });

  it("resets quotas at the next Redis-time window", async () => {
    const commands = new InMemoryRateLimitScriptCommands(NOW);
    const limiter = new RedisPublishingRateLimiter(commands, policies, NAMESPACE);

    await limiter.consume({
      action: "provider.paid-work",
      tenantKey: tenant("alpha"),
      cost: 2,
    });
    await expect(
      limiter.consume({ action: "provider.paid-work", tenantKey: tenant("alpha") }),
    ).resolves.toMatchObject({ allowed: false });

    commands.setNow(NOW + WINDOW);

    await expect(
      limiter.consume({ action: "provider.paid-work", tenantKey: tenant("alpha") }),
    ).resolves.toMatchObject({ allowed: true, tenant: { remaining: 1 } });
  });

  it("turns a denial into a safe 429-ready error", async () => {
    const commands = new InMemoryRateLimitScriptCommands(NOW);
    const limiter = new RedisPublishingRateLimiter(commands, policies, NAMESPACE);
    const request = {
      action: "provider.paid-work" as const,
      tenantKey: tenant("alpha"),
      cost: 2,
    };

    await enforcePublishingRateLimit(limiter, request);
    await expect(enforcePublishingRateLimit(limiter, request)).rejects.toEqual(
      new PublishingRateLimitExceededError("provider.paid-work", 60),
    );
  });

  it("fails closed when Redis fails or returns a malformed protocol result", async () => {
    const failingLimiter = new RedisPublishingRateLimiter(
      {
        eval: async () => {
          throw new Error("redis://user:secret@private.invalid");
        },
      },
      policies,
      NAMESPACE,
    );
    const malformedLimiter = new RedisPublishingRateLimiter(
      { eval: async () => [1, 2] },
      policies,
      NAMESPACE,
    );
    const request = {
      action: "oauth.callback" as const,
      tenantKey: tenant("alpha"),
    };

    await expect(failingLimiter.consume(request)).rejects.toEqual(
      new PublishingRateLimitStorageError(),
    );
    await expect(malformedLimiter.consume(request)).rejects.toEqual(
      new PublishingRateLimitStorageError(),
    );
  });
});
