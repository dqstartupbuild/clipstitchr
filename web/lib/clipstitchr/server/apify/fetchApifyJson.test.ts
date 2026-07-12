import { describe, expect, it, vi } from "vitest";
import { fetchApifyJson } from "@/lib/clipstitchr/server/apify/fetchApifyJson";

describe("fetchApifyJson", () => {
  it("uses a safe error without exposing the provider response", async () => {
    const fetcher = vi.fn(async () =>
      new Response("provider detail containing a secret", { status: 429 }),
    );

    await expect(
      fetchApifyJson(
        "https://api.apify.com/v2/test?token=secret-token",
        { method: "GET" },
        fetcher as unknown as typeof fetch,
      ),
    ).rejects.toThrow("Apify could not complete the request.");
  });

  it("does not expose a token included in a network error", async () => {
    const fetcher = vi.fn(async () => {
      throw new Error("Failed https://api.apify.com/?token=secret-token");
    });

    const request = fetchApifyJson(
      "https://api.apify.com/v2/test?token=secret-token",
      { method: "GET" },
      fetcher as unknown as typeof fetch,
    );

    await expect(request).rejects.toThrow("Apify could not complete the request.");
    await expect(request).rejects.not.toThrow("secret-token");
  });

  it("aborts a request that exceeds its timeout", async () => {
    vi.useFakeTimers();

    try {
      const fetcher = vi.fn(
        async (...args: Parameters<typeof fetch>) =>
          new Promise<Response>((resolve, reject) => {
            void resolve;
            args[1]?.signal?.addEventListener("abort", () => {
              reject(new DOMException("Aborted", "AbortError"));
            });
          }),
      );
      const request = fetchApifyJson(
        "https://api.apify.com/v2/test",
        { method: "GET" },
        fetcher as unknown as typeof fetch,
        100,
      );
      const expectation = expect(request).rejects.toThrow(
        "Apify took too long to respond.",
      );

      await vi.advanceTimersByTimeAsync(100);
      await expectation;
    } finally {
      vi.useRealTimers();
    }
  });
});
