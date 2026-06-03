import { mergeProductDetailsWithWebsiteDetails } from "@/lib/clipstitchr/server/mergeProductDetailsWithWebsiteDetails";
import { scrapeProductWebsiteDetails } from "@/lib/clipstitchr/server/scrapeProductWebsiteDetails";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";

export async function createProductProfileInputWithWebsiteDetails({
  product,
  shouldScrapeWebsite,
}: {
  product: ProductProfileCreateInput;
  shouldScrapeWebsite: boolean;
}): Promise<ProductProfileCreateInput> {
  if (!shouldScrapeWebsite || !product.websiteUrl) {
    return product;
  }

  const websiteDetails = await scrapeProductWebsiteDetails(product.websiteUrl);

  return {
    ...product,
    productDetails: mergeProductDetailsWithWebsiteDetails({
      productDetails: product.productDetails,
      websiteDetails,
    }),
  };
}
