import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { scrapeProductWebsiteDetails } from "@/lib/clipstitchr/server/scrapeProductWebsiteDetails";

const fetchMock = vi.fn();

function createJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}

describe("scrapeProductWebsiteDetails", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("FIRECRAWL_API_KEY", "firecrawl-key");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("crawls up to 15 website pages with Firecrawl", async () => {
    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse({
          success: true,
          id: "crawl_123",
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse({
          status: "completed",
          data: [
            {
              links: ["https://launchkit.example.com/pricing"],
              markdown: "# LaunchKit\n\nPlan launches faster.",
              metadata: {
                description: "Launch planning for founders.",
                sourceURL: "https://launchkit.example.com/",
                title: "LaunchKit",
              },
              summary: "LaunchKit helps founders plan launches.",
            },
            {
              markdown: "# Pricing\n\nSimple launch planning pricing.",
              metadata: {
                sourceURL: "https://launchkit.example.com/pricing",
                title: "Pricing",
              },
            },
          ],
        }),
      );

    const details = await scrapeProductWebsiteDetails(
      "https://launchkit.example.com/",
    );

    expect(details).toContain("Plan launches faster.");
    expect(details).toContain("Simple launch planning pricing.");
  });

  it("starts the product website crawl with a landing-page cap", async () => {
    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse({
          success: true,
          id: "crawl_123",
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse({
          status: "completed",
          data: [
            {
              markdown: "# LaunchKit\n\nPlan launches faster.",
            },
          ],
        }),
      );

    await scrapeProductWebsiteDetails("https://launchkit.example.com/");

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://api.firecrawl.dev/v2/crawl",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          authorization: "Bearer firecrawl-key",
        }),
      }),
    );
    const requestOptions = fetchMock.mock.calls[0][1] as RequestInit;

    expect(JSON.parse(requestOptions.body as string)).toMatchObject({
      allowExternalLinks: false,
      crawlEntireDomain: true,
      limit: 15,
      scrapeOptions: {
        formats: ["markdown", "summary", "links"],
        onlyMainContent: true,
      },
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://api.firecrawl.dev/v2/crawl/crawl_123",
      expect.objectContaining({
        method: "GET",
      }),
    );
  });

  it("returns Firecrawl error messages", async () => {
    fetchMock.mockResolvedValue(
      createJsonResponse(
        {
          success: false,
          error: "Unable to scrape URL.",
        },
        422,
      ),
    );

    await expect(
      scrapeProductWebsiteDetails("https://launchkit.example.com/"),
    ).rejects.toThrow("Unable to scrape URL.");
  });
});
