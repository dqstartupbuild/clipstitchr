import { describe, expect, it, vi } from "vitest";

import { RedisServiceAssertionReplayProtector } from "../src/assertions/RedisServiceAssertionReplayProtector.js";
import { ServiceAssertionReplayProtectionError } from "../src/errors/ServiceAssertionReplayProtectionError.js";
import { InMemoryRedisStringCommands } from "./support/InMemoryRedisStringCommands.js";
import { createRedisSecurityNamespace } from "../src/redis/createRedisSecurityNamespace.js";

const NOW = 1_785_600_000_000;
const REPLAY_KEY = `service-assertion:v1:${"A".repeat(43)}`;
const NAMESPACE = createRedisSecurityNamespace("production");

describe("RedisServiceAssertionReplayProtector", () => {
  it("uses one atomic Redis SET with NX and a bounded millisecond TTL", async () => {
    const commands = new InMemoryRedisStringCommands(() => NOW);
    const protector = new RedisServiceAssertionReplayProtector(
      commands,
      NAMESPACE,
      () => NOW,
    );

    await expect(protector.consume(REPLAY_KEY, NOW + 60_000)).resolves.toBe(true);
    expect(commands.setCalls).toHaveLength(1);
    expect(commands.setCalls[0]).toMatchObject({
      key: `clipstitchr:production:${REPLAY_KEY}`,
      options: { NX: true, PX: 60_000 },
    });
    expect(commands.setCalls[0]?.value).toMatch(/^[A-Za-z0-9_-]{22}$/);
  });

  it("allows only one concurrent consumer", async () => {
    const commands = new InMemoryRedisStringCommands(() => NOW);
    const protector = new RedisServiceAssertionReplayProtector(
      commands,
      NAMESPACE,
      () => NOW,
    );
    const results = await Promise.all([
      protector.consume(REPLAY_KEY, NOW + 60_000),
      protector.consume(REPLAY_KEY, NOW + 60_000),
    ]);

    expect(results.sort()).toEqual([false, true]);
  });

  it("rejects expired or malformed replay records without touching Redis", async () => {
    const commands = new InMemoryRedisStringCommands(() => NOW);
    const setSpy = vi.spyOn(commands, "set");
    const protector = new RedisServiceAssertionReplayProtector(
      commands,
      NAMESPACE,
      () => NOW,
    );

    await expect(protector.consume(REPLAY_KEY, NOW)).resolves.toBe(false);
    await expect(protector.consume("unsafe-key", NOW + 60_000)).resolves.toBe(false);
    expect(setSpy).not.toHaveBeenCalled();
  });

  it("fails closed when Redis is unavailable", async () => {
    const protector = new RedisServiceAssertionReplayProtector(
      {
        set: async () => {
          throw new Error("redis credentials must not escape");
        },
      },
      NAMESPACE,
      () => NOW,
    );

    await expect(protector.consume(REPLAY_KEY, NOW + 60_000)).rejects.toEqual(
      new ServiceAssertionReplayProtectionError(),
    );
  });

  it("isolates identical replay keys by deployment namespace", async () => {
    const commands = new InMemoryRedisStringCommands(() => NOW);
    const production = new RedisServiceAssertionReplayProtector(
      commands,
      createRedisSecurityNamespace("production"),
      () => NOW,
    );
    const staging = new RedisServiceAssertionReplayProtector(
      commands,
      createRedisSecurityNamespace("staging"),
      () => NOW,
    );

    await expect(production.consume(REPLAY_KEY, NOW + 60_000)).resolves.toBe(true);
    await expect(staging.consume(REPLAY_KEY, NOW + 60_000)).resolves.toBe(true);
    expect(commands.setCalls.map(({ key }) => key).sort()).toEqual([
      `clipstitchr:production:${REPLAY_KEY}`,
      `clipstitchr:staging:${REPLAY_KEY}`,
    ]);
  });
});
