import { describe, expect, it, vi } from "vitest";
import { createProductProfileInputWithWebsiteDetails } from "@/lib/clipstitchr/server/createProductProfileInputWithWebsiteDetails";

const mocks = vi.hoisted(() => ({
  scrapeProductWebsiteDetails: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/scrapeProductWebsiteDetails", () => ({
  scrapeProductWebsiteDetails: mocks.scrapeProductWebsiteDetails,
}));

describe("createProductProfileInputWithWebsiteDetails", () => {
  it("scrapes website details for enrichment without changing saved product details", async () => {
    mocks.scrapeProductWebsiteDetails.mockResolvedValue("Website page content.");

    await expect(
      createProductProfileInputWithWebsiteDetails({
        product: {
          audienceDetails: "Founders",
          name: "LaunchKit",
          productDetails: "Manual details.",
          websiteUrl: "https://launchkit.example.com/",
        },
        shouldScrapeWebsite: true,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        productDetails: "Manual details.",
        websiteDetails: "Website page content.",
      }),
    );

    await expect(
      createProductProfileInputWithWebsiteDetails({
        product: {
          audienceDetails: "Founders",
          name: "LaunchKit",
          productDetails: "Manual details.",
          websiteUrl: "https://launchkit.example.com/",
        },
        shouldScrapeWebsite: false,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        productDetails: "Manual details.",
      }),
    );
  });
});
