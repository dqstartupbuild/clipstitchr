import { describe, expect, it } from "vitest";
import { isAllowedLoopsRecipient } from "@/lib/clipstitchr/email/loops/isAllowedLoopsRecipient";

describe("isAllowedLoopsRecipient", () => {
  it("requires an exact normalized match in development", () => {
    const allowlist = "first@example.com, Safe@Example.com";

    expect(
      isAllowedLoopsRecipient(" safe@example.com ", "development", allowlist),
    ).toBe(true);
    expect(
      isAllowedLoopsRecipient("other@example.com", "development", allowlist),
    ).toBe(false);
    expect(
      isAllowedLoopsRecipient("safe@example.com", "development", undefined),
    ).toBe(false);
  });

  it("does not apply the development allowlist to a production team", () => {
    expect(
      isAllowedLoopsRecipient("subscriber@example.com", "production", undefined),
    ).toBe(true);
  });
});
