const websiteSourcedDetailsPattern =
  /\n{2,}Website-sourced details:\n[\s\S]*$/i;

export function stripWebsiteSourcedProductDetails(productDetails: string) {
  return productDetails.replace(websiteSourcedDetailsPattern, "").trim();
}
