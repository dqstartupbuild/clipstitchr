import type { CliprPlaceholderFillers } from "@/lib/clipstitchr/types/CliprPlaceholderFillers";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

export function getCliprProductPlaceholderFillers(
  product: ProductProfile,
): CliprPlaceholderFillers {
  const inferredPainPoint = product.inferredPainPoints[0] ?? "";
  const savedFillers = product.cliprPlaceholderFillers ?? {};

  return {
    ...savedFillers,
    audience: uniqueValues([
      product.audienceDetails,
      ...(savedFillers.audience ?? []),
    ]),
    topic: uniqueValues([
      product.productDetails,
      product.name,
      ...(savedFillers.topic ?? []),
    ]),
    problem: uniqueValues([
      product.inferredProblem ?? "",
      inferredPainPoint,
      ...(savedFillers.problem ?? []),
    ]),
    pain_point: uniqueValues([
      inferredPainPoint,
      ...product.inferredPainPoints,
      ...(savedFillers.pain_point ?? []),
    ]),
    result: uniqueValues([
      "a clearer workflow",
      "less wasted effort",
      ...(savedFillers.result ?? []),
    ]),
  };
}
