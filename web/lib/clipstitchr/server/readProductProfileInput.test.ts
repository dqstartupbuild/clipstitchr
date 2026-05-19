import { describe, expect, it } from "vitest";
import { readProductProfileInput } from "@/lib/clipstitchr/server/readProductProfileInput";

describe("readProductProfileInput", () => {
  it("trims product profile text fields", () => {
    expect(
      readProductProfileInput({
        name: "  LaunchKit  ",
        productDetails: "  AI launch planning  ",
        audienceDetails: "  solo founders  ",
      }),
    ).toEqual({
      name: "LaunchKit",
      productDetails: "AI launch planning",
      audienceDetails: "solo founders",
    });
  });

  it("accepts valid preferred Clipr hook styles", () => {
    expect(
      readProductProfileInput({
        name: "LaunchKit",
        productDetails: "AI launch planning",
        audienceDetails: "solo founders",
        preferredCliprHookStyleKey: "identity_challenge",
      }).preferredCliprHookStyleKey,
    ).toBe("identity_challenge");
  });

  it("ignores invalid preferred Clipr hook styles", () => {
    expect(
      readProductProfileInput({
        name: "LaunchKit",
        productDetails: "AI launch planning",
        audienceDetails: "solo founders",
        preferredCliprHookStyleKey: "fake_style",
      }),
    ).not.toHaveProperty("preferredCliprHookStyleKey");
  });

  it("requires a product name", () => {
    expect(() =>
      readProductProfileInput({
        name: "   ",
        productDetails: "Details",
        audienceDetails: "Audience",
      }),
    ).toThrow("Product name is required.");
  });
});
