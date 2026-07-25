import { getStitchrHookContextText } from "@/lib/clipstitchr/server/getStitchrHookContextText";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { StitchrTextGenerationClipContext } from "@/lib/clipstitchr/types/StitchrTextGenerationClipContext";

const safeDerivedVariables = new Set([
  "app_label",
  "audience",
  "category",
  "identity",
  "pain_point",
  "problem",
  "product_name",
  "thing",
  "topic",
  "workflow",
]);

const styleContextPatterns: Record<string, RegExp> = {
  anti_advice: /\b(advice|myth|wrong|mistake|stop|instead)\b/i,
  before_after_arc:
    /\b(after|before|change|improve|progress|result|transform)\b/i,
  cold_open_story: /\b(confession|day|moment|story|then|when)\b/i,
  cost_alert: /\b(cost|frustrat|lose|pain|problem|struggle|waste)\b/i,
  direct_diagnosis:
    /\b(fail|frustrat|mistake|pain|problem|struggle|wrong)\b/i,
  identity_challenge:
    /\b(athlete|beginner|creator|founder|identity|people|person|who)\b/i,
  inside_room: /\b(behind|process|screen|show|step|workflow)\b/i,
  mystery_gap: /\b(curious|hidden|reveal|surpris|unexpected|wonder)\b/i,
  pattern_break:
    /\b(expression|react|shock|stare|surpris|unexpected|wow)\b/i,
  receipt_stack:
    /\b(compare|demo|evidence|progress|proof|result|screen|show)\b/i,
  test_drive:
    /\b(compare|demo|test|tried|using|versus|vs)\b/i,
  vulnerable_reveal:
    /\b(confess|embarrass|frustrat|honest|personal|struggle)\b/i,
  viewer_dare: /\b(challenge|rep|test|try|would you|your turn)\b/i,
};

const unsupportedClaimPattern =
  /\b(100%|guarantee|guaranteed|in \d+ (day|days|hour|hours|minute|minutes)|saves? (me |you )?(a |an |\d+)|the best|data proves?|no human edit)\b/i;

export function getStitchrHookTemplateRelevanceScore({
  clipContexts,
  product,
  template,
}: {
  clipContexts: StitchrTextGenerationClipContext[];
  product: ProductProfile;
  template: CliprHookTemplate;
}) {
  const contextText = getStitchrHookContextText(product, clipContexts);
  const savedVariables = new Set(
    Object.entries(product.cliprPlaceholderFillers ?? {})
      .filter(([, values]) => values.some((value) => value.trim()))
      .map(([key]) => key),
  );
  const unsupportedVariableCount = template.requiredVariables.filter(
    (variable) =>
      !safeDerivedVariables.has(variable) && !savedVariables.has(variable),
  ).length;
  const metadataWords = [
    template.emotionalTrigger,
    ...template.bestFor,
    template.styleKey.replace(/_/g, " "),
  ]
    .join(" ")
    .toLowerCase()
    .match(/[a-z0-9]+/g) ?? [];
  const metadataMatches = metadataWords.filter(
    (word) => word.length > 3 && contextText.includes(word),
  ).length;
  const preferredStyleBonus =
    product.preferredCliprHookStyleKey === template.styleKey ? 14 : 0;
  const savedTemplateBonus = product.eligibleCliprHookTemplateIds?.includes(
    template.id,
  )
    ? 18
    : 0;
  const savedStyleBonus = product.eligibleCliprHookStyleKeys?.includes(
    template.styleKey,
  )
    ? 8
    : 0;
  const contextStyleBonus = styleContextPatterns[template.styleKey]?.test(
    contextText,
  )
    ? 10
    : 0;
  const sourceBonus = template.source === "app_hook_library" ? 3 : 0;
  const polarizingPenalty =
    template.source === "polarizing_reaction_patterns" &&
    !/\b(compare|opinion|react|shock|surpris|versus|vs)\b/i.test(contextText)
      ? 12
      : 0;
  const aggressivePenalty =
    template.riskLevel === "aggressive" &&
    !/\b(challenge|compare|opinion|react|shock|surpris)\b/i.test(contextText)
      ? 8
      : 0;
  const claimPenalty = unsupportedClaimPattern.test(template.template) ? 20 : 0;

  return (
    preferredStyleBonus +
    savedTemplateBonus +
    savedStyleBonus +
    contextStyleBonus +
    sourceBonus +
    metadataMatches * 2 -
    unsupportedVariableCount * 5 -
    polarizingPenalty -
    aggressivePenalty -
    claimPenalty
  );
}
