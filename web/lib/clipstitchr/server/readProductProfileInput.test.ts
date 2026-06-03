import { describe, expect, it } from "vitest";
import { readProductProfileInput } from "@/lib/clipstitchr/server/readProductProfileInput";

describe("readProductProfileInput", () => {
  it("trims product profile text fields", () => {
    expect(
      readProductProfileInput({
        name: "  LaunchKit  ",
        websiteUrl: " launchkit.example.com ",
        productDetails: "  AI launch planning  ",
        audienceDetails: "  solo founders  ",
      }),
    ).toEqual({
      name: "LaunchKit",
      websiteUrl: "https://launchkit.example.com/",
      productDetails: "AI launch planning",
      audienceDetails: "solo founders",
    });
  });

  it("rejects private or unsupported website URLs", () => {
    expect(() =>
      readProductProfileInput({
        name: "LaunchKit",
        websiteUrl: "http://localhost:3000",
        productDetails: "AI launch planning",
        audienceDetails: "solo founders",
      }),
    ).toThrow("Website URL must be a public website.");

    expect(() =>
      readProductProfileInput({
        name: "LaunchKit",
        websiteUrl: "ftp://launchkit.example.com",
        productDetails: "AI launch planning",
        audienceDetails: "solo founders",
      }),
    ).toThrow("Website URL must use http or https.");
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
