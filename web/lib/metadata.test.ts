import { describe, expect, it } from "vitest";
import { createPageMetadata } from "@/lib/metadata";

describe("createPageMetadata", () => {
  it("creates canonical, Open Graph, and Twitter metadata from a path", () => {
    const metadata = createPageMetadata({
      title: "Blog | My Site",
      description:
        "Read articles, guides, and resources on the blog. Stay up to date with the latest content and insights from our team.",
      canonical: "/blog",
      keywords: ["blog"],
    });

    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/blog");
    expect(metadata.openGraph).toMatchObject({
      url: "http://localhost:3000/blog",
    });
    expect(metadata.twitter).toMatchObject({
      title: "Blog | My Site",
    });
  });
});
