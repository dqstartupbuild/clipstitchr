import { describe, expect, it } from "vitest";
import { getEmailConfirmationCsrfIsValid } from "@/lib/clipstitchr/email/confirmation/getEmailConfirmationCsrfIsValid";

describe("getEmailConfirmationCsrfIsValid", () => {
  it("accepts only matching fixed-length cookie and form tokens", () => {
    const token = "a".repeat(43);

    expect(getEmailConfirmationCsrfIsValid(token, token)).toBe(true);
    expect(getEmailConfirmationCsrfIsValid(token, "b".repeat(43))).toBe(false);
    expect(getEmailConfirmationCsrfIsValid(null, token)).toBe(false);
    expect(getEmailConfirmationCsrfIsValid("short", "short")).toBe(false);
  });
});
