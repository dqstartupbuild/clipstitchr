import { describe, expect, it } from "vitest";

import { ProviderTokenEnvelopeError } from "../src/errors/ProviderTokenEnvelopeError.js";
import { resolveClerkTenantIdentity } from "../src/identity/resolveClerkTenantIdentity.js";
import type { ProviderTokenContext } from "../src/tokens/ProviderTokenContext.js";
import type { ProviderTokenEnvelope } from "../src/tokens/ProviderTokenEnvelope.js";
import { createProviderTokenCipherKey } from "../src/tokens/createProviderTokenCipherKey.js";
import { createProviderTokenKeyring } from "../src/tokens/createProviderTokenKeyring.js";
import { decryptProviderToken } from "../src/tokens/decryptProviderToken.js";
import { encryptProviderToken } from "../src/tokens/encryptProviderToken.js";

const key = createProviderTokenCipherKey(
  "primary-2026-08",
  Buffer.alloc(32, 21).toString("base64"),
);
const keyring = createProviderTokenKeyring([key]);
const context: ProviderTokenContext = {
  tenantKey: resolveClerkTenantIdentity({
    actorUserId: "user_member_123",
    activeOrganizationId: "org_brand_456",
  }).tenantKey,
  provider: "instagram",
  integrationId: "integration_123456",
  tokenKind: "access",
};

describe("provider token encryption", () => {
  it("round trips a token without embedding plaintext", () => {
    const plaintext = "provider-token-value-that-must-stay-secret";
    const envelope = encryptProviderToken(plaintext, key, context);

    expect(envelope).toMatch(/^cst1\.primary-2026-08\./);
    expect(envelope).not.toContain(plaintext);
    expect(decryptProviderToken(envelope, keyring, context)).toBe(plaintext);
  });

  it("uses a fresh random nonce for every encryption", () => {
    const first = encryptProviderToken("same-token", key, context);
    const second = encryptProviderToken("same-token", key, context);

    expect(first).not.toBe(second);
  });

  it.each([
    {
      name: "tenant",
      context: {
        ...context,
        tenantKey: resolveClerkTenantIdentity({ actorUserId: "user_other_999" })
          .tenantKey,
      },
    },
    {
      name: "provider",
      context: { ...context, provider: "tiktok" as const },
    },
    {
      name: "integration",
      context: { ...context, integrationId: "integration_999999" },
    },
    {
      name: "token kind",
      context: { ...context, tokenKind: "refresh" as const },
    },
  ])("authenticates the $name context", ({ context: wrongContext }) => {
    const envelope = encryptProviderToken("bound-token", key, context);

    expect(() => decryptProviderToken(envelope, keyring, wrongContext)).toThrow(
      expect.objectContaining({ reason: "authentication" }),
    );
  });

  it("rejects ciphertext tampering", () => {
    const envelope = encryptProviderToken("bound-token", key, context);
    const segments = envelope.split(".");
    const ciphertext = segments[3] ?? "";
    const tamperedCiphertext = Buffer.from(ciphertext, "base64url");
    tamperedCiphertext[0] = (tamperedCiphertext[0] ?? 0) ^ 1;
    segments[3] = tamperedCiphertext.toString("base64url");

    expect(() =>
      decryptProviderToken(segments.join(".") as ProviderTokenEnvelope, keyring, context),
    ).toThrow(expect.objectContaining({ reason: "authentication" }));
  });

  it("supports rotation while rejecting an unknown key ID", () => {
    const rotatedKey = createProviderTokenCipherKey(
      "secondary-2026-09",
      Buffer.alloc(32, 22).toString("base64"),
    );
    const envelope = encryptProviderToken("rotation-token", rotatedKey, context);

    expect(() => decryptProviderToken(envelope, keyring, context)).toThrow(
      expect.objectContaining({ reason: "unknown-key" }),
    );
    expect(
      decryptProviderToken(
        envelope,
        createProviderTokenKeyring([key, rotatedKey]),
        context,
      ),
    ).toBe("rotation-token");
  });

  it("rejects an unsupported envelope version", () => {
    const envelope = encryptProviderToken("bound-token", key, context);
    const unsupported = envelope.replace(/^cst1\./, "cst2.") as ProviderTokenEnvelope;

    expect(() => decryptProviderToken(unsupported, keyring, context)).toThrow(
      expect.objectContaining({ reason: "unsupported-version" }),
    );
  });

  it("never includes token material in an authentication error", () => {
    const plaintext = "secret-material-never-in-error";
    const envelope = encryptProviderToken(plaintext, key, context);

    try {
      decryptProviderToken(envelope, keyring, { ...context, provider: "tiktok" });
      throw new Error("Expected decryption to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(ProviderTokenEnvelopeError);
      expect((error as Error).message).not.toContain(plaintext);
      expect((error as Error).message).not.toContain(envelope);
    }
  });
});
