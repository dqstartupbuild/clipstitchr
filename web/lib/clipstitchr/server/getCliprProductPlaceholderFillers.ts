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
  const currentYear = String(new Date().getFullYear());

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
    common_assumption: uniqueValues([
      "more effort means better results",
      "the old way is safer",
      ...(savedFillers.common_assumption ?? []),
    ]),
    controversial_take: uniqueValues([
      "the accepted way is slowing you down",
      "the obvious fix is not the real fix",
      ...(savedFillers.controversial_take ?? []),
    ]),
    core_belief: uniqueValues([
      "doing it manually means it is more authentic",
      "more tools mean better results",
      ...(savedFillers.core_belief ?? []),
    ]),
    goal: uniqueValues([
      "getting the next post out",
      "a repeatable content workflow",
      ...(savedFillers.goal ?? []),
    ]),
    habit: uniqueValues([
      inferredPainPoint,
      "keeping up with content",
      ...(savedFillers.habit ?? []),
    ]),
    identity: uniqueValues([
      product.audienceDetails,
      ...(savedFillers.identity ?? []),
    ]),
    method: uniqueValues([
      product.name,
      "doing everything manually",
      "guessing what will work",
      ...(savedFillers.method ?? []),
    ]),
    new_way: uniqueValues([
      product.name,
      "a cleaner process",
      ...(savedFillers.new_way ?? []),
    ]),
    number: uniqueValues(["3", "5", "30", ...(savedFillers.number ?? [])]),
    old_way: uniqueValues([
      "doing everything manually",
      "guessing from a blank page",
      ...(savedFillers.old_way ?? []),
    ]),
    option_a: uniqueValues([
      "doing everything manually",
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
    popular_method: uniqueValues([
      "doing everything manually",
      "copying what everyone else posts",
      ...(savedFillers.popular_method ?? []),
    ]),
    result: uniqueValues([
      "fewer unfinished posts",
      "cleaner publish-ready content",
      ...(savedFillers.result ?? []),
    ]),
    real_thing: uniqueValues([
      "the repeatable system",
      "the part that actually moves the output",
      ...(savedFillers.real_thing ?? []),
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
    time: uniqueValues([
      "3 hours per post",
      "20 minutes of cleanup",
      ...(savedFillers.time ?? []),
    ]),
    time_period: uniqueValues([
      "two weeks",
      "one month",
      ...(savedFillers.time_period ?? []),
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
    trend: uniqueValues([
      "AI-assisted content",
      "faster creative cycles",
      ...(savedFillers.trend ?? []),
    ]),
    workflow: uniqueValues([
      product.inferredProblem ?? "",
      product.productDetails,
      ...(savedFillers.workflow ?? []),
    ]),
    year: uniqueValues([currentYear, ...(savedFillers.year ?? [])]),
  };
}
