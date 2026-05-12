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
