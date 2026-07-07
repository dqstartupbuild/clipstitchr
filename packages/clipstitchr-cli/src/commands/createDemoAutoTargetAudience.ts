import type { ProductSummary } from "../api/ProductSummary.js";

export function createDemoAutoTargetAudience(input: {
  audience?: string;
  product: ProductSummary;
}) {
  return input.audience?.trim() || `people evaluating ${input.product.name}`;
}
