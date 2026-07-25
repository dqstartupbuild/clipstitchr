import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

export function createStitchrFallbackHook(product: ProductProfile) {
  const problem =
    product.inferredPainPoints[0] ??
    product.inferredProblem ??
    "the next step can actually feel clear";
  const normalizedProblem = problem
    .trim()
    .replace(/[.!?]+$/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 11)
    .join(" ");

  return `me realizing ${normalizedProblem}`.slice(0, 140);
}
