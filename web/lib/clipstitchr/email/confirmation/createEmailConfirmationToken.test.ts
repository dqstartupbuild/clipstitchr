import { describe, expect, it } from "vitest";
import { createEmailConfirmationToken } from "@/lib/clipstitchr/email/confirmation/createEmailConfirmationToken";
import { emailConfirmationTokenTtlMs } from "@/lib/clipstitchr/email/confirmation/emailConfirmationTokenTtlMs";

describe("createEmailConfirmationToken", () => {
  it("creates a 48-hour URL without contact or browser identity", async () => {
    const now = Date.UTC(2026, 6, 13, 12);
    const token = await createEmailConfirmationToken(
      "https://clipstitchr.com/dashboard?ignored=true",
      "a long development-only confirmation secret",
      now,
    );
    const url = new URL(token.url);

    expect(token.expiresAt).toBe(now + emailConfirmationTokenTtlMs);
    expect(token.tokenRecordId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(token.tokenDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(url.origin).toBe("https://clipstitchr.com");
    expect(url.pathname).toBe("/email/confirm");
    expect(url.searchParams.get("id")).toBe(token.tokenRecordId);
    expect(url.searchParams.get("expires")).toBe(String(token.expiresAt));
    expect(url.searchParams.get("signature")).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(token.url).not.toContain("@");
    expect(token.url).not.toContain("contactId");
    expect(token.url).not.toContain("browserToken");
  });
});
