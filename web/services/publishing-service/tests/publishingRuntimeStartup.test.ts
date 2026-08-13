import { createServer } from "node:http";

import { afterEach, describe, expect, it } from "vitest";

import type { PublishingProviderRuntime } from "../src/provider-runtime/registry/PublishingProviderRuntime.js";
import { createEnabledPublishingProviderRuntimeRegistry } from "../src/runtime/createEnabledPublishingProviderRuntimeRegistry.js";
import { createPublishingLeaseOwner } from "../src/runtime/createPublishingLeaseOwner.js";
import { PublishingRuntimeCleanupStack } from "../src/runtime/PublishingRuntimeCleanupStack.js";
import { closePublishingHttpServer } from "../src/server/closePublishingHttpServer.js";
import { listenPublishingHttpServer } from "../src/server/listenPublishingHttpServer.js";

describe("publishing runtime startup", () => {
  const servers = new Set<ReturnType<typeof createServer>>();

  afterEach(async () => {
    await Promise.all(
      [...servers].map(async (server) => {
        await closePublishingHttpServer(server);
        servers.delete(server);
      }),
    );
  });

  it("runs startup cleanup in reverse order without replacing the root failure", async () => {
    const order: string[] = [];
    const cleanup = new PublishingRuntimeCleanupStack();

    cleanup.add(() => {
      order.push("database");
    });
    cleanup.add(() => {
      order.push("redis");
      throw new Error("cleanup failed");
    });
    cleanup.add(async () => {
      order.push("server");
    });

    await expect(cleanup.run()).resolves.toBeUndefined();
    expect(order).toEqual(["server", "redis", "database"]);
    await expect(cleanup.run()).resolves.toBeUndefined();
  });

  it("rejects a bind failure so startup can clean up acquired resources", async () => {
    const occupied = createServer();
    const conflicting = createServer();
    servers.add(occupied);
    servers.add(conflicting);

    await listenPublishingHttpServer(occupied, "127.0.0.1", 0);
    const address = occupied.address();

    if (address === null || typeof address === "string") {
      throw new Error("Test server did not expose a TCP address.");
    }

    await expect(
      listenPublishingHttpServer(conflicting, "127.0.0.1", address.port),
    ).rejects.toMatchObject({ code: "EADDRINUSE" });
  });

  it("creates a fresh valid lease owner for every process runtime", () => {
    const first = createPublishingLeaseOwner(
      42,
      () => "6ba7b810-9dad-41d1-80b4-00c04fd430c8",
    );
    const second = createPublishingLeaseOwner(
      42,
      () => "6ba7b811-9dad-41d1-80b4-00c04fd430c8",
    );

    expect(first).toBe(
      "publishing-service:42:6ba7b810-9dad-41d1-80b4-00c04fd430c8",
    );
    expect(second).not.toBe(first);
    expect(() => createPublishingLeaseOwner(42, () => "unsafe/value")).toThrow(
      "lease identifier",
    );
  });

  it("registers exactly the enabled provider subset", () => {
    const tikTokRuntime = {
      id: "tiktok",
    } as unknown as PublishingProviderRuntime;

    const registry = createEnabledPublishingProviderRuntimeRegistry(
      ["tiktok"],
      [tikTokRuntime],
    );

    expect([...registry.keys()]).toEqual(["tiktok"]);
    expect(() =>
      createEnabledPublishingProviderRuntimeRegistry(
        ["instagram", "tiktok"],
        [tikTokRuntime],
      ),
    ).toThrow();
    expect(() =>
      createEnabledPublishingProviderRuntimeRegistry(
        ["tiktok"],
        [tikTokRuntime, tikTokRuntime],
      ),
    ).toThrow();
  });
});
