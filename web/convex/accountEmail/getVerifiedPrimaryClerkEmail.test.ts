import { describe, expect, it } from "vitest";
import { getVerifiedPrimaryClerkEmail } from "./getVerifiedPrimaryClerkEmail";

function createEmail(
  id: string,
  emailAddress: string,
  status: "unverified" | "verified",
) {
  return {
    email_address: emailAddress,
    id,
    verification: { status },
  };
}

describe("getVerifiedPrimaryClerkEmail", () => {
  it("selects and normalizes only the verified primary email", () => {
    expect(
      getVerifiedPrimaryClerkEmail({
        email_addresses: [
          createEmail("secondary", "other@example.com", "verified"),
          createEmail("primary", " Person@Example.COM ", "verified"),
        ],
        primary_email_address_id: "primary",
      }),
    ).toEqual({
      normalizedEmail: "person@example.com",
      primaryEmailId: "primary",
    });
  });

  it.each([
    ["unverified", "person@example.com"],
    ["verified", "not-an-email"],
  ] as const)(
    "rejects a %s or invalid primary address",
    (status, emailAddress) => {
      expect(
        getVerifiedPrimaryClerkEmail({
          email_addresses: [createEmail("primary", emailAddress, status)],
          primary_email_address_id: "primary",
        }),
      ).toBeNull();
    },
  );

  it("does not fall back to a verified non-primary address", () => {
    expect(
      getVerifiedPrimaryClerkEmail({
        email_addresses: [
          createEmail("secondary", "other@example.com", "verified"),
          createEmail("primary", "person@example.com", "unverified"),
        ],
        primary_email_address_id: "primary",
      }),
    ).toBeNull();
  });
});
