import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  readBlogImageObject: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/blog/readBlogImageObject", () => ({
  readBlogImageObject: mocks.readBlogImageObject,
}));

import { GET } from "@/app/blog-images/[...path]/route";

function createRouteProps(path: string[]) {
  return {
    params: Promise.resolve({ path }),
  };
}

describe("GET /blog-images/[...path]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.readBlogImageObject.mockResolvedValue({
      body: new Uint8Array([1, 2, 3]),
      contentType: "image/webp",
    });
  });

  it("serves copied blog images from the blog R2 prefix", async () => {
    const response = await GET(
      new Request("https://clipstitchr.test/blog-images/post/hero.webp"),
      createRouteProps(["post", "hero.webp"]),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(response.headers.get("cache-control")).toContain("immutable");
    expect(mocks.readBlogImageObject).toHaveBeenCalledWith(
      "blog-images/post/hero.webp",
    );
    await expect(response.arrayBuffer()).resolves.toEqual(
      new Uint8Array([1, 2, 3]).buffer,
    );
  });

  it("rejects unsafe image paths", async () => {
    const response = await GET(
      new Request("https://clipstitchr.test/blog-images/../secret"),
      createRouteProps(["..", "secret"]),
    );

    expect(response.status).toBe(404);
    expect(mocks.readBlogImageObject).not.toHaveBeenCalled();
  });
});
