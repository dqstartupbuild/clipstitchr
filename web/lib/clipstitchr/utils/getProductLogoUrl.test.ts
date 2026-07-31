import { describe, expect, it } from "vitest";
import { getProductLogoUrl } from "@/lib/clipstitchr/utils/getProductLogoUrl";

describe("getProductLogoUrl", () => {
  it("uses the product website origin for its icon", () => {
    expect(
      getProductLogoUrl("https://example.com/products/mobile?ref=sidebar"),
    ).toBe("https://example.com/favicon.ico");
  });

  it("skips missing, invalid, insecure, and unsupported website URLs", () => {
    expect(getProductLogoUrl()).toBeUndefined();
    expect(getProductLogoUrl("not a URL")).toBeUndefined();
    expect(getProductLogoUrl("http://example.com")).toBeUndefined();
    expect(getProductLogoUrl("data:text/plain,logo")).toBeUndefined();
  });
});
