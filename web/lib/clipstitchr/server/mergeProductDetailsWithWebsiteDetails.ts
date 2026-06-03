const PRODUCT_DETAILS_MAX_LENGTH = 2000;

export function mergeProductDetailsWithWebsiteDetails({
  productDetails,
  websiteDetails,
}: {
  productDetails: string;
  websiteDetails: string;
}) {
  return [
    productDetails.trim(),
    websiteDetails.trim() ? `Website-sourced details:\n${websiteDetails.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, PRODUCT_DETAILS_MAX_LENGTH)
    .trim();
}
