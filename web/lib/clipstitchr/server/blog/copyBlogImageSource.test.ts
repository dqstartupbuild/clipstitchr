import { beforeEach, describe, expect, it, vi } from "vitest";
import { copyBlogImageSource } from "./copyBlogImageSource";

const mocks = vi.hoisted(() => ({
  fetchBlogImageSource: vi.fn(),
  putR2Object: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/blog/fetchBlogImageSource", () => ({
  fetchBlogImageSource: mocks.fetchBlogImageSource,
}));

vi.mock("@/lib/clipstitchr/server/r2/putR2Object", () => ({
  putR2Object: mocks.putR2Object,
}));

describe("copyBlogImageSource", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.fetchBlogImageSource.mockResolvedValue({
      body: new Uint8Array([1, 2, 3]).buffer,
      contentType: "image/png",
    });
    mocks.putR2Object.mockResolvedValue({
      key: "blog-images/a-helpful-blog-title/image.png",
      contentType: "image/png",
      size: 3,
    });
  });

  it("stores fetched image bytes in the public blog R2 prefix", async () => {
    const url = await copyBlogImageSource({
      slug: "a-helpful-blog-title",
      sourceUrl: "https://blogger.test/path/hero.png?signature=temporary",
    });

    expect(mocks.fetchBlogImageSource).toHaveBeenCalledWith(
      "https://blogger.test/path/hero.png?signature=temporary",
    );
    expect(mocks.putR2Object).toHaveBeenCalledWith({
      body: new Uint8Array([1, 2, 3]).buffer,
      contentType: "image/png",
      key: expect.stringMatching(
        /^blog-images\/a-helpful-blog-title\/[a-f0-9]{16}-hero\.png$/,
      ),
    });
    expect(url).toMatch(
      /^http:\/\/localhost:3000\/blog-images\/a-helpful-blog-title\/[a-f0-9]{16}-hero\.png$/,
    );
  });
});
