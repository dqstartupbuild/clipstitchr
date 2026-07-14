import { describe, expect, it } from "vitest";
import type { Doc } from "../_generated/dataModel";
import { getEmailConfirmationTokenIsAvailable } from "./getEmailConfirmationTokenIsAvailable";

const now = Date.UTC(2026, 6, 13);
const contact = {
  deletionStatus: "active",
  suppressionStatus: "none",
} as Doc<"marketingContacts">;
const token = {
  expiresAt: now + 1_000,
  tokenDigest: "a".repeat(64),
} as Doc<"emailConfirmationTokens">;

describe("email confirmation availability", () => {
  it("accepts only the matching unused current reference", () => {
    expect(
      getEmailConfirmationTokenIsAvailable({
        contact,
        expiresAt: token.expiresAt,
        inspectedAt: now,
        token,
        tokenDigest: token.tokenDigest,
      }),
    ).toBe(true);
  });

  it("fails closed for scanners inspecting expired, used, or deleted state", () => {
    expect(
      getEmailConfirmationTokenIsAvailable({
        contact,
        expiresAt: token.expiresAt,
        inspectedAt: token.expiresAt,
        token,
        tokenDigest: token.tokenDigest,
      }),
    ).toBe(false);
    expect(
      getEmailConfirmationTokenIsAvailable({
        contact,
        expiresAt: token.expiresAt,
        inspectedAt: now,
        token: { ...token, usedAt: now } as Doc<"emailConfirmationTokens">,
        tokenDigest: token.tokenDigest,
      }),
    ).toBe(false);
    expect(
      getEmailConfirmationTokenIsAvailable({
        contact: {
          ...contact,
          deletionStatus: "privacyDeleted",
        } as Doc<"marketingContacts">,
        expiresAt: token.expiresAt,
        inspectedAt: now,
        token,
        tokenDigest: token.tokenDigest,
      }),
    ).toBe(false);
  });
});
