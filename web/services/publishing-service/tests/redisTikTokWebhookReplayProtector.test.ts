import { describe, expect, it } from "vitest";

import { RedisTikTokWebhookReplayProtector } from "../src/provider-runtime/tiktok/RedisTikTokWebhookReplayProtector.js";
import { createRedisSecurityNamespace } from "../src/redis/createRedisSecurityNamespace.js";
import { InMemoryRedisStringCommands } from "./support/InMemoryRedisStringCommands.js";

describe("RedisTikTokWebhookReplayProtector", () => {
  it("claims one opaque webhook digest once with a bounded TTL", async () => {
    const commands = new InMemoryRedisStringCommands(Date.now);
    const protector = new RedisTikTokWebhookReplayProtector(
      commands,
      createRedisSecurityNamespace("test"),
    );
    const dedupeKey = "A".repeat(43);

    await expect(protector.claim(dedupeKey, 86_400_000)).resolves.toBe(true);
    await expect(protector.claim(dedupeKey, 86_400_000)).resolves.toBe(false);
  });

  it("rejects malformed keys or excessive TTLs without writing", async () => {
    const commands = new InMemoryRedisStringCommands(Date.now);
    const protector = new RedisTikTokWebhookReplayProtector(
      commands,
      createRedisSecurityNamespace("test"),
    );

    await expect(protector.claim("not-a-digest", 86_400_000)).resolves.toBe(false);
    await expect(
      protector.claim("A".repeat(43), 604_800_001),
    ).resolves.toBe(false);
  });

  it("fails closed when Redis is unavailable", async () => {
    const protector = new RedisTikTokWebhookReplayProtector(
      {
        set: async () => {
          throw new Error("redis://user:secret@private.invalid");
        },
      },
      createRedisSecurityNamespace("test"),
    );

    await expect(protector.claim("A".repeat(43), 86_400_000)).rejects.toMatchObject({
      name: "PublishingRedisUnavailableError",
    });
  });
});
