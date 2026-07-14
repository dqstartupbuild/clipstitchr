import { describe, expect, it } from "vitest";
import { createProviderContactKey } from "@/lib/clipstitchr/email/contact/createProviderContactKey";

describe("createProviderContactKey", () => {
  it("creates a random opaque key that contains no contact data", () => {
    const first = createProviderContactKey();
    const second = createProviderContactKey();

    expect(first).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(second).not.toBe(first);
    expect(first).not.toContain("@");
  });
});
