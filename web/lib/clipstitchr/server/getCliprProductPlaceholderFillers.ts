import type { CliprPlaceholderFillers } from "@/lib/clipstitchr/types/CliprPlaceholderFillers";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

const fillerLabelPattern =
  /^(audience|category|goal|outcome|pain point|problem solved|problem|product details|product|result|task|topic|workflow):\s*/i;
const leadingHelperVerbPattern =
  /^(helps|lets|allows|enables)\s+[a-z0-9&'-]+\s+(to\s+)?/i;
const trailingPunctuationPattern = /[.!?]+$/;

function normalizeFillerValue(value: string) {
  const trimmedValue = value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^["']|["']$/g, "");

  if (!trimmedValue || /{{|}}/.test(trimmedValue)) {
    return "";
  }

  const unlabeledValue = trimmedValue.replace(fillerLabelPattern, "").trim();
  const withoutHelperVerb = unlabeledValue.replace(
    leadingHelperVerbPattern,
    "",
  );
  const naturalValue =
    withoutHelperVerb.split(/\s+/).length >= 2
      ? withoutHelperVerb
      : unlabeledValue;

  return naturalValue
    .replace(trailingPunctuationPattern, "")
    .trim()
    .split(/\s+/)
    .slice(0, 12)
    .join(" ");
}

function uniqueValues(values: string[]) {
  return Array.from(
    new Set(values.map(normalizeFillerValue).filter(Boolean)),
  );
}

export function getCliprProductPlaceholderFillers(
  product: ProductProfile,
): CliprPlaceholderFillers {
  const inferredPainPoint = product.inferredPainPoints[0] ?? "";
  const savedFillers = product.cliprPlaceholderFillers ?? {};

  return {
    ...savedFillers,
    product_name: uniqueValues([
      product.name,
      ...(savedFillers.product_name ?? []),
    ]),
    app_label: uniqueValues([
      product.name,
      "this app",
      ...(savedFillers.app_label ?? []),
    ]),
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
    category: uniqueValues([
      product.productDetails,
      product.name,
      ...(savedFillers.category ?? []),
    ]),
    goal: uniqueValues([
      "a smoother workflow",
      "better creative output",
      ...(savedFillers.goal ?? []),
    ]),
    habit: uniqueValues([
      inferredPainPoint,
      "keeping up with content",
      ...(savedFillers.habit ?? []),
    ]),
    method: uniqueValues([
      product.name,
      "a simpler workflow",
      ...(savedFillers.method ?? []),
    ]),
    new_way: uniqueValues([
      product.name,
      "a cleaner process",
      ...(savedFillers.new_way ?? []),
    ]),
    number: uniqueValues(["3", "5", "30", ...(savedFillers.number ?? [])]),
    old_way: uniqueValues([
      "the manual way",
      "the old process",
      ...(savedFillers.old_way ?? []),
    ]),
    option_a: uniqueValues([
      "the manual way",
      ...(savedFillers.option_a ?? []),
    ]),
    option_b: uniqueValues([
      product.name,
      "the simpler way",
      ...(savedFillers.option_b ?? []),
    ]),
    period: uniqueValues([
      "month",
      "launch",
      ...(savedFillers.period ?? []),
    ]),
    result: uniqueValues([
      "a clearer workflow",
      "less wasted effort",
      ...(savedFillers.result ?? []),
    ]),
    task: uniqueValues([
      product.inferredProblem ?? "",
      "getting content out",
      ...(savedFillers.task ?? []),
    ]),
    thing: uniqueValues([
      product.productDetails,
      product.name,
      ...(savedFillers.thing ?? []),
    ]),
    timeframe: uniqueValues([
      "one week",
      "30 days",
      ...(savedFillers.timeframe ?? []),
    ]),
    tool: uniqueValues([
      product.name,
      ...(savedFillers.tool ?? []),
    ]),
    workflow: uniqueValues([
      product.inferredProblem ?? "",
      product.productDetails,
      ...(savedFillers.workflow ?? []),
    ]),
  };
}
