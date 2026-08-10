import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

export function createSocialPublishingProductAccountSelections(
  products: ProductProfile[],
) {
  return Object.fromEntries(
    products.map((product) => [
      product.id,
      product.socialPublishingSocialAccountIds ?? [],
    ]),
  );
}
