import type { ProductSummary } from "../api/ProductSummary.js";
import type { ClipstitchrConfig } from "./ClipstitchrConfig.js";

export function createProductConfigSummary(
  product: ProductSummary,
): NonNullable<ClipstitchrConfig["product"]> {
  return {
    id: product.id,
    name: product.name,
    updatedAt: product.updatedAt,
    websiteUrl: product.websiteUrl,
  };
}
