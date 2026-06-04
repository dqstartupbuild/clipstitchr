import { scrapeProductWebsiteDetails } from "@/lib/clipstitchr/server/scrapeProductWebsiteDetails";
import type { ProductEnrichmentInput } from "@/lib/clipstitchr/types/ProductEnrichmentInput";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";

export async function createProductProfileInputWithWebsiteDetails({
  product,
  shouldScrapeWebsite,
}: {
  product: ProductProfileCreateInput;
  shouldScrapeWebsite: boolean;
}): Promise<ProductEnrichmentInput> {
  if (!shouldScrapeWebsite || !product.websiteUrl) {
    return product;
  }

  const websiteDetails = await scrapeProductWebsiteDetails(product.websiteUrl);

  return {
    ...product,
    websiteDetails,
  };
}
