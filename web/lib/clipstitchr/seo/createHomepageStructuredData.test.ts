import { describe, expect, it } from "vitest";
import { createHomepageStructuredData } from "@/lib/clipstitchr/seo/createHomepageStructuredData";

describe("createHomepageStructuredData", () => {
  it("describes the public page and the real ClipStitchr application", () => {
    const data = createHomepageStructuredData();

    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@graph"]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ "@type": "WebPage" }),
        expect.objectContaining({
          "@type": "SoftwareApplication",
          applicationCategory: "BusinessApplication",
          offers: expect.objectContaining({ price: "39" }),
        }),
      ]),
    );
  });
});
