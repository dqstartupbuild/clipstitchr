import { describe, expect, it } from "vitest";
import { browserRecognitionCookieName } from "@/lib/clipstitchr/tools/browserRecognition/browserRecognitionCookieName";
import { browserRecognitionTtlSeconds } from "@/lib/clipstitchr/tools/browserRecognition/browserRecognitionTtlSeconds";
import { createBrowserRecognitionCookieHeader } from "@/lib/clipstitchr/tools/browserRecognition/createBrowserRecognitionCookieHeader";
import { createBrowserRecognitionToken } from "@/lib/clipstitchr/tools/browserRecognition/createBrowserRecognitionToken";
import { hashBrowserRecognitionToken } from "@/lib/clipstitchr/tools/browserRecognition/hashBrowserRecognitionToken";
import { readBrowserRecognitionToken } from "@/lib/clipstitchr/tools/browserRecognition/readBrowserRecognitionToken";

describe("browser recognition token", () => {
  it("creates a random opaque token and a one-way server digest", async () => {
    const first = createBrowserRecognitionToken();
    const second = createBrowserRecognitionToken();

    expect(first).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(second).not.toBe(first);
    await expect(hashBrowserRecognitionToken(first)).resolves.toMatch(
      /^[0-9a-f]{64}$/,
    );
  });

  it("serializes an HttpOnly 180-day same-site cookie", () => {
    const token = createBrowserRecognitionToken();
    const cookie = createBrowserRecognitionCookieHeader(token, true);

    expect(cookie).toContain(`${browserRecognitionCookieName}=${token}`);
    expect(cookie).toContain(`Max-Age=${browserRecognitionTtlSeconds}`);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Strict");
    expect(cookie).toContain("Secure");
    expect(cookie).not.toContain("email");
    expect(cookie).not.toContain("name");
  });

  it("reads only correctly shaped recognition tokens", () => {
    const token = createBrowserRecognitionToken();
    const request = new Request("https://clipstitchr.com/tools/example", {
      headers: { cookie: `${browserRecognitionCookieName}=${token}; other=x` },
    });
    const invalidRequest = new Request(
      "https://clipstitchr.com/tools/example",
      { headers: { cookie: `${browserRecognitionCookieName}=person@example.com` } },
    );

    expect(readBrowserRecognitionToken(request)).toBe(token);
    expect(readBrowserRecognitionToken(invalidRequest)).toBeNull();
  });
});
