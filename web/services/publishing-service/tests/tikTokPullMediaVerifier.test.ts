import { describe, expect, it, vi } from "vitest";

import { createTikTokPullMediaVerifier } from "../src/provider-runtime/tiktok/createTikTokPullMediaVerifier.js";

describe("createTikTokPullMediaVerifier", () => {
  it("requires the exact configured gateway origin and a successful range-capable HEAD", async () => {
    const fetchImplementation = vi.fn(async () =>
      new Response(null, {
        status: 200,
        headers: { "Accept-Ranges": "bytes", "Content-Length": "123" },
      }),
    );
    const verify = createTikTokPullMediaVerifier(
      "https://media.clipstitchr.invalid",
      fetchImplementation,
    );
    const token = "a".repeat(80);

    await expect(
      verify(
        new URL(
          `https://media.clipstitchr.invalid/api/publishing/media/${token}`,
        ),
      ),
    ).resolves.toBe(true);
    expect(fetchImplementation).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({ method: "HEAD", redirect: "error" }),
    );
  });

  it("does no network work for foreign origins, query strings, or nested paths", async () => {
    const fetchImplementation = vi.fn();
    const verify = createTikTokPullMediaVerifier(
      "https://media.clipstitchr.invalid",
      fetchImplementation,
    );
    const token = "a".repeat(80);

    await expect(
      verify(new URL(`https://evil.invalid/api/publishing/media/${token}`)),
    ).resolves.toBe(false);
    await expect(
      verify(
        new URL(
          `https://media.clipstitchr.invalid/api/publishing/media/${token}?copy=1`,
        ),
      ),
    ).resolves.toBe(false);
    await expect(
      verify(
        new URL(
          `https://media.clipstitchr.invalid/api/publishing/media/${token}/extra`,
        ),
      ),
    ).resolves.toBe(false);
    expect(fetchImplementation).not.toHaveBeenCalled();
  });
});
