import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { decryptSocialToken } from "./decryptSocialToken";
import { encryptSocialToken } from "./encryptSocialToken";

const originalKeys = process.env.SOCIAL_TOKEN_ENCRYPTION_KEYS;
const originalVersion =
  process.env.SOCIAL_TOKEN_ENCRYPTION_CURRENT_VERSION;

describe("social token encryption", () => {
  beforeEach(() => {
    process.env.SOCIAL_TOKEN_ENCRYPTION_KEYS = JSON.stringify({
      1: Buffer.alloc(32, 1).toString("base64"),
      2: Buffer.alloc(32, 2).toString("base64"),
    });
    process.env.SOCIAL_TOKEN_ENCRYPTION_CURRENT_VERSION = "2";
  });

  afterEach(() => {
    process.env.SOCIAL_TOKEN_ENCRYPTION_KEYS = originalKeys;
    process.env.SOCIAL_TOKEN_ENCRYPTION_CURRENT_VERSION = originalVersion;
  });

  it("round-trips a token without storing its plaintext", () => {
    const encrypted = encryptSocialToken("  secret-provider-token  ");

    expect(encrypted.version).toBe(2);
    expect(encrypted.ciphertext).not.toContain("secret-provider-token");
    expect(decryptSocialToken(encrypted.ciphertext, encrypted.version)).toBe(
      "secret-provider-token",
    );
  });

  it("rejects tampering and unavailable key versions", () => {
    const encrypted = encryptSocialToken("secret-provider-token");
    const parts = encrypted.ciphertext.split(".");
    const tamperedPayload = `${parts[2][0] === "a" ? "b" : "a"}${parts[2].slice(1)}`;
    const tampered = `${parts[0]}.${parts[1]}.${tamperedPayload}`;

    expect(() => decryptSocialToken(tampered, encrypted.version)).toThrow();
    expect(() => decryptSocialToken(encrypted.ciphertext, 3)).toThrow(
      "key 3 is unavailable",
    );
  });
});
