import { listProducts } from "../api/listProducts.js";
import type { ProductSummary } from "../api/ProductSummary.js";
import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";

export async function resolveDemoAutoProduct(input: {
  credentials: ClipstitchrCredentials;
  preferredProductId?: string;
}): Promise<ProductSummary> {
  const { products } = await listProducts(input.credentials);

  if (input.preferredProductId) {
    const preferredProduct = products.find(
      (product) => product.id === input.preferredProductId,
    );

    if (!preferredProduct) {
      throw new Error(
        `No ClipStitchr product found for ${input.preferredProductId}.`,
      );
    }

    return preferredProduct;
  }

  if (products.length === 1) {
    return products[0];
  }

  if (!products.length) {
    throw new Error("Create a ClipStitchr product before running demo auto.");
  }

  throw new Error(
    "Run `clipstitchr products use` or pass --product before running demo auto.",
  );
}
