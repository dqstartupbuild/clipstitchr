import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

export function createPostBridgeProductAccountSelections(
  products: ProductProfile[],
) {
  return Object.fromEntries(
    products.map((product) => [
      product.id,
      product.postBridgeSocialAccountIds ?? [],
    ]),
  );
}
