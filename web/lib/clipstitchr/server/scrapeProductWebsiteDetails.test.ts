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

  it("scrapes markdown product context with Firecrawl", async () => {
    fetchMock.mockResolvedValue(
      createJsonResponse({
        success: true,
        data: {
          markdown: "# LaunchKit\n\nPlan launches faster.",
          metadata: {
            description: "Launch planning for founders.",
            sourceURL: "https://launchkit.example.com/",
            title: "LaunchKit",
          },
        },
      }),
    );

    await expect(
      scrapeProductWebsiteDetails("https://launchkit.example.com/"),
    ).resolves.toContain("Plan launches faster.");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.firecrawl.dev/v2/scrape",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          authorization: "Bearer firecrawl-key",
        }),
        body: expect.stringContaining('"formats":["markdown"]'),
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
