import { createProductWebsiteDetailsText } from "@/lib/clipstitchr/server/createProductWebsiteDetailsText";
import { getFirecrawlApiKey } from "@/lib/clipstitchr/server/getFirecrawlApiKey";

const FIRECRAWL_SCRAPE_ENDPOINT = "https://api.firecrawl.dev/v2/scrape";

type FirecrawlScrapeResponse = {
  data?: Parameters<typeof createProductWebsiteDetailsText>[0];
  error?: string;
  message?: string;
  success?: boolean;
};

function getFirecrawlErrorMessage(
  body: FirecrawlScrapeResponse | null,
  status: number,
) {
  return (
    body?.message ||
    body?.error ||
    `Firecrawl could not import this website. Status ${status}.`
  );
}

export async function scrapeProductWebsiteDetails(url: string) {
  const response = await fetch(FIRECRAWL_SCRAPE_ENDPOINT, {
    method: "POST",
    headers: {
      authorization: `Bearer ${getFirecrawlApiKey()}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["markdown"],
      onlyMainContent: true,
      removeBase64Images: true,
      blockAds: true,
      timeout: 30000,
      maxAge: 172800000,
    }),
  });
  const body = (await response.json().catch(() => null)) as
    | FirecrawlScrapeResponse
    | null;

  if (!response.ok || body?.success !== true || !body.data) {
    throw new Error(getFirecrawlErrorMessage(body, response.status));
  }

  const details = createProductWebsiteDetailsText(body.data, url);

  if (!details) {
    throw new Error("Firecrawl did not return readable website details.");
  }

  return details;
}
