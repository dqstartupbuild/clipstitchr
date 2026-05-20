import { afterEach, describe, expect, it, vi } from "vitest";
import { hashTikTokIdentifier } from "@/lib/clipstitchr/analytics/hashTikTokIdentifier";

describe("hashTikTokIdentifier", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("hashes trimmed lowercase identifiers as hex", async () => {
    const digest = vi.fn(async () => new Uint8Array([0, 15, 255]).buffer);

    vi.stubGlobal("crypto", {
      subtle: {
        digest,
      },
    });

    await expect(hashTikTokIdentifier(" USER@Example.COM ")).resolves.toBe(
      "000fff",
    );
    expect(digest).toHaveBeenCalledWith(
      "SHA-256",
      new TextEncoder().encode("user@example.com"),
    );
  });

  it("returns null for blank values or unavailable crypto", async () => {
    await expect(hashTikTokIdentifier("   ")).resolves.toBeNull();

    vi.stubGlobal("crypto", {});

    await expect(hashTikTokIdentifier("user@example.com")).resolves.toBeNull();
  });
});
