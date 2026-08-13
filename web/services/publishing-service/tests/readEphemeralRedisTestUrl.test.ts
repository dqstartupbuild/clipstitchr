import { describe, expect, it } from "vitest";

import { readEphemeralRedisTestUrl } from "./support/readEphemeralRedisTestUrl.js";

describe("readEphemeralRedisTestUrl", () => {
  it("requires an explicit ephemeral-test marker", () => {
    expect(() =>
      readEphemeralRedisTestUrl({
        STUDIO_PUBLISHING_TEST_STUDIO_PUBLISHING_REDIS_URL: "redis://127.0.0.1:6379/0",
      }),
    ).toThrow("Ephemeral Redis integration testing is not enabled.");
  });

  it.each([
    "redis://production.redis.invalid:6379/0",
    "redis://user:secret@127.0.0.1:6379/0",
    "redis://127.0.0.1:6379/1",
    "rediss://127.0.0.1:6379/0",
  ])("rejects a non-ephemeral target: %s", (redisUrl) => {
    expect(() =>
      readEphemeralRedisTestUrl({
        STUDIO_PUBLISHING_TEST_REDIS_EPHEMERAL: "true",
        STUDIO_PUBLISHING_TEST_STUDIO_PUBLISHING_REDIS_URL: redisUrl,
      }),
    ).toThrow("Unsafe Redis integration test target.");
  });

  it.each([
    "redis://127.0.0.1:6379/0",
    "redis://clipstitchr-test-redis-node22:6379/0",
  ])("accepts a disposable target: %s", (redisUrl) => {
    expect(
      readEphemeralRedisTestUrl({
        STUDIO_PUBLISHING_TEST_REDIS_EPHEMERAL: "true",
        STUDIO_PUBLISHING_TEST_STUDIO_PUBLISHING_REDIS_URL: redisUrl,
      }),
    ).toBe(redisUrl);
  });
});
