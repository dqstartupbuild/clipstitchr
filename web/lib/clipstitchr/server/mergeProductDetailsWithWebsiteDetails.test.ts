import { describe, expect, it } from "vitest";
import { mergeProductDetailsWithWebsiteDetails } from "@/lib/clipstitchr/server/mergeProductDetailsWithWebsiteDetails";

describe("mergeProductDetailsWithWebsiteDetails", () => {
  it("appends website details and caps saved product details", () => {
    const merged = mergeProductDetailsWithWebsiteDetails({
      productDetails: "Manual positioning.",
      websiteDetails: "Website context. ".repeat(400),
    });

    expect(merged).toContain("Manual positioning.");
    expect(merged).toContain("Website-sourced details:");
    expect(merged.length).toBeLessThanOrEqual(2000);
  });
});
