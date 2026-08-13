import { describe, expect, it, vi } from "vitest";

import { createHttpPublishingDispatchAccessAuthorizer } from "../src/dispatch-access/createHttpPublishingDispatchAccessAuthorizer.js";

describe("createHttpPublishingDispatchAccessAuthorizer", () => {
  it("sends only the bounded owner and Product scope to the fixed web route", async () => {
    const fetchImplementation = vi.fn(async () =>
      Response.json({ allowed: true }),
    );
    const authorize = createHttpPublishingDispatchAccessAuthorizer({
      appOrigin: "https://clipstitchr.test",
      secret: "dispatch-secret-value-that-is-long-enough",
      fetchImplementation,
    });
    const signal = new AbortController().signal;

    await expect(
      authorize({ ownerId: "user_123", productId: "product_123" }, signal),
    ).resolves.toBe(true);
    expect(fetchImplementation).toHaveBeenCalledWith(
      new URL(
        "https://clipstitchr.test/api/studio/publishing/internal/dispatch-access",
      ),
      expect.objectContaining({
        body: JSON.stringify({
          ownerId: "user_123",
          productId: "product_123",
        }),
        headers: {
          "content-type": "application/json",
          "x-clipstitchr-publishing-dispatch-secret":
            "dispatch-secret-value-that-is-long-enough",
        },
        method: "POST",
        redirect: "error",
      }),
    );
  });

  it("returns a denied decision and rejects malformed or unavailable authority responses", async () => {
    const denied = createHttpPublishingDispatchAccessAuthorizer({
      appOrigin: "https://clipstitchr.test",
      secret: "dispatch-secret-value-that-is-long-enough",
      fetchImplementation: vi.fn(async () => Response.json({ allowed: false })),
    });
    await expect(
      denied(
        { ownerId: "user_123", productId: "product_123" },
        new AbortController().signal,
      ),
    ).resolves.toBe(false);

    for (const response of [
      Response.json({ error: "unavailable" }, { status: 503 }),
      Response.json({ allowed: true, extra: true }),
      new Response("not-json"),
      new Response("{}", { headers: { "content-length": "257" } }),
      new Response(new Uint8Array([0xff, 0xfe])),
    ]) {
      const authorize = createHttpPublishingDispatchAccessAuthorizer({
        appOrigin: "https://clipstitchr.test",
        secret: "dispatch-secret-value-that-is-long-enough",
        fetchImplementation: vi.fn(async () => response),
      });

      await expect(
        authorize(
          { ownerId: "user_123", productId: "product_123" },
          new AbortController().signal,
        ),
      ).rejects.toThrow("could not be verified");
    }
  });
});
