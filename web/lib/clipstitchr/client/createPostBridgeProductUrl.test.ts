import { describe, expect, it } from "vitest";
import { createPostBridgeProductUrl } from "@/lib/clipstitchr/client/createPostBridgeProductUrl";

describe("createPostBridgeProductUrl", () => {
  it("adds a trimmed product query parameter", () => {
    expect(
      createPostBridgeProductUrl("/api/post-bridge/posts", " product_1 "),
    ).toBe("/api/post-bridge/posts?productId=product_1");
  });

  it("keeps the base path when no product is selected", () => {
    expect(createPostBridgeProductUrl("/api/post-bridge/posts", " ")).toBe(
      "/api/post-bridge/posts",
    );
  });
});
