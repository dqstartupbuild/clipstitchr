import { describe, expect, it } from "vitest";

import { PublishingRedisUnavailableError } from "../src/errors/PublishingRedisUnavailableError.js";
import { checkPublishingServiceReadiness } from "../src/health/checkPublishingServiceReadiness.js";
import { createIoredisPublishingRedisRuntime } from "../src/redis/createIoredisPublishingRedisRuntime.js";
import { createPublishingRedisReadinessDependency } from "../src/redis/createPublishingRedisReadinessDependency.js";

describe("ioredis publishing Redis runtime", () => {
  it("fails closed before connection and reports only a safe readiness state", async () => {
    const runtime = createIoredisPublishingRedisRuntime(
      "redis://username:do-not-echo@127.0.0.1:1/0",
    );

    await expect(runtime.commands.get("key")).rejects.toEqual(
      new PublishingRedisUnavailableError(),
    );
    await expect(
      checkPublishingServiceReadiness([
        createPublishingRedisReadinessDependency(runtime),
      ]),
    ).resolves.toEqual({
      service: "clipstitchr-publishing-service",
      status: "not_ready",
      checks: [{ name: "redis", status: "not_ready" }],
    });

    await runtime.close();
  });

  it("does not expose a Redis URL or credentials when connection fails", async () => {
    const runtime = createIoredisPublishingRedisRuntime(
      "redis://username:do-not-echo@127.0.0.1:1/0",
    );

    try {
      await runtime.connect();
      throw new Error("Expected the connection to fail.");
    } catch (error) {
      expect(error).toEqual(new PublishingRedisUnavailableError());
      expect(JSON.stringify(error)).not.toContain("do-not-echo");
      expect((error as Error).message).not.toContain("127.0.0.1");
    } finally {
      await runtime.close();
    }
  });

  it("rejects an invalid Redis target without reflecting it", () => {
    expect(() =>
      createIoredisPublishingRedisRuntime("https://secret.invalid/redis"),
    ).toThrow(new PublishingRedisUnavailableError());
  });
});
