import { describe, expect, it } from "vitest";
import { createSocialPublishingProductUrl } from "@/lib/clipstitchr/client/createSocialPublishingProductUrl";

describe("createSocialPublishingProductUrl", () => {
  it("adds a trimmed product query parameter", () => {
    expect(
      createSocialPublishingProductUrl("/api/social-publishing/posts", " product_1 "),
    ).toBe("/api/social-publishing/posts?productId=product_1");
  });

  it("keeps the base path when no product is selected", () => {
    expect(createSocialPublishingProductUrl("/api/social-publishing/posts", " ")).toBe(
      "/api/social-publishing/posts",
    );
  });
});
