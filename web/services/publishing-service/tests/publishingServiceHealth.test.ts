import { createServer } from "node:http";
import { once } from "node:events";

import { describe, expect, it } from "vitest";

import { checkPublishingServiceReadiness } from "../src/health/checkPublishingServiceReadiness.js";
import { createPublishingServiceHealthReport } from "../src/health/createPublishingServiceHealthReport.js";
import { createPublishingServiceRequestHandler } from "../src/server/createPublishingServiceRequestHandler.js";

describe("publishing service health surfaces", () => {
  it("reports process liveness without claiming dependency readiness", async () => {
    expect(createPublishingServiceHealthReport()).toEqual({
      service: "clipstitchr-publishing-service",
      status: "ok",
      version: 1,
    });

    await expect(checkPublishingServiceReadiness([])).resolves.toEqual({
      service: "clipstitchr-publishing-service",
      status: "not_ready",
      checks: [],
    });
  });

  it("returns only dependency names and readiness states", async () => {
    const report = await checkPublishingServiceReadiness([
      { name: "postgresql", check: async () => undefined },
      {
        name: "redis",
        check: async () => {
          throw new Error("redis://username:secret@private-host.invalid");
        },
      },
    ]);

    expect(report).toEqual({
      service: "clipstitchr-publishing-service",
      status: "not_ready",
      checks: [
        { name: "postgresql", status: "ready" },
        { name: "redis", status: "not_ready" },
      ],
    });
    expect(JSON.stringify(report)).not.toContain("private-host");
    expect(JSON.stringify(report)).not.toContain("secret");
  });

  it("bounds dependency checks with a timeout", async () => {
    await expect(
      checkPublishingServiceReadiness(
        [{ name: "temporal", check: () => new Promise(() => undefined) }],
        10,
      ),
    ).resolves.toMatchObject({
      status: "not_ready",
      checks: [{ name: "temporal", status: "not_ready" }],
    });
  });

  it("serves health, readiness, method, and not-found HTTP responses", async () => {
    const server = createServer(
      createPublishingServiceRequestHandler({
        readinessDependencies: [
          { name: "postgresql", check: async () => undefined },
          { name: "redis", check: async () => undefined },
          { name: "temporal", check: async () => undefined },
        ],
        studioBetaEnabled: true,
      }),
    );

    server.listen(0, "127.0.0.1");
    await once(server, "listening");

    try {
      const address = server.address();

      if (address === null || typeof address === "string") {
        throw new TypeError("Expected an IP listener.");
      }

      const origin = `http://127.0.0.1:${address.port}`;
      const healthResponse = await fetch(`${origin}/healthz`);
      const readinessResponse = await fetch(`${origin}/readyz`);
      const missingResponse = await fetch(`${origin}/missing`);
      const methodResponse = await fetch(`${origin}/healthz`, { method: "POST" });

      expect(healthResponse.status).toBe(200);
      expect(await healthResponse.json()).toMatchObject({ status: "ok" });
      expect(healthResponse.headers.get("cache-control")).toBe("no-store");
      expect(readinessResponse.status).toBe(200);
      expect(await readinessResponse.json()).toMatchObject({ status: "ready" });
      expect(missingResponse.status).toBe(404);
      expect(methodResponse.status).toBe(405);
    } finally {
      server.close();
      await once(server, "close");
    }
  });
});
