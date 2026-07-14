import { describe, expect, it } from "vitest";
import { createEmailConfirmationToken } from "@/lib/clipstitchr/email/confirmation/createEmailConfirmationToken";
import { verifyEmailConfirmationUrl } from "@/lib/clipstitchr/email/confirmation/verifyEmailConfirmationUrl";

const secret = "a long development-only confirmation secret";

describe("verifyEmailConfirmationUrl", () => {
  it("returns only the durable token lookup fields for a valid URL", async () => {
    const token = await createEmailConfirmationToken(
      "https://clipstitchr.com",
      secret,
      Date.UTC(2026, 6, 13, 12),
    );

    await expect(verifyEmailConfirmationUrl(token.url, secret)).resolves.toEqual(
      {
        expiresAt: token.expiresAt,
        tokenDigest: token.tokenDigest,
        tokenRecordId: token.tokenRecordId,
      },
    );
  });

  it("rejects tampering, duplicate fields, and a different secret", async () => {
    const token = await createEmailConfirmationToken(
      "https://clipstitchr.com",
      secret,
      Date.UTC(2026, 6, 13, 12),
    );
    const tamperedUrl = new URL(token.url);
    tamperedUrl.searchParams.set("expires", String(token.expiresAt + 1));

    await expect(
      verifyEmailConfirmationUrl(tamperedUrl, secret),
    ).resolves.toBeNull();

    const duplicateUrl = new URL(token.url);
    duplicateUrl.searchParams.append("id", token.tokenRecordId);
    await expect(
      verifyEmailConfirmationUrl(duplicateUrl, secret),
    ).resolves.toBeNull();

    await expect(
      verifyEmailConfirmationUrl(token.url, "another signing secret"),
    ).resolves.toBeNull();
  });
});
