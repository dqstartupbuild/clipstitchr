import { getStitchrHookTemplateRelevanceScore } from "@/lib/clipstitchr/server/getStitchrHookTemplateRelevanceScore";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { StitchrTextGenerationClipContext } from "@/lib/clipstitchr/types/StitchrTextGenerationClipContext";

const stitchrCandidateCount = 18;
const stitchrDiscoveryCandidateCount = 12;
const maximumCandidatesPerStyle = 3;

export function selectStitchrHookCandidates({
  clipContexts,
  product,
  templates,
}: {
  clipContexts: StitchrTextGenerationClipContext[];
  product: ProductProfile;
  templates: CliprHookTemplate[];
}) {
  const templateScores = new Map(
    templates.map((template) => [
      template.id,
      getStitchrHookTemplateRelevanceScore({
        clipContexts,
        product,
        template,
      }),
    ]),
  );
  const rankedTemplates = [...templates].sort((left, right) => {
    const scoreDifference =
      (templateScores.get(right.id) ?? 0) - (templateScores.get(left.id) ?? 0);

    return scoreDifference || left.id.localeCompare(right.id);
  });
  const discoveryStyleCounts = new Map<string, number>();
  const discoveryTemplates = rankedTemplates
    .filter((template) => {
      if (template.source !== "ugc_discovery_patterns") {
        return false;
      }

      const currentCount = discoveryStyleCounts.get(template.styleKey) ?? 0;

      if (currentCount >= maximumCandidatesPerStyle) {
        return false;
      }

      discoveryStyleCounts.set(template.styleKey, currentCount + 1);
      return true;
    })
    .slice(0, stitchrDiscoveryCandidateCount);
  const selectedIds = new Set(
    discoveryTemplates.map((template) => template.id),
  );
  const styleCounts = new Map<string, number>();

  for (const template of discoveryTemplates) {
    styleCounts.set(
      template.styleKey,
      (styleCounts.get(template.styleKey) ?? 0) + 1,
    );
  }

  const supportingTemplates = rankedTemplates.filter((template) => {
    if (
      selectedIds.has(template.id) ||
      template.source === "ugc_discovery_patterns"
    ) {
      return false;
    }

    const currentCount = styleCounts.get(template.styleKey) ?? 0;

    if (currentCount >= maximumCandidatesPerStyle) {
      return false;
    }

    styleCounts.set(template.styleKey, currentCount + 1);
    return true;
  });
  const prioritizedTemplates = [
    ...discoveryTemplates,
    ...supportingTemplates,
  ].slice(0, stitchrCandidateCount);
  const prioritizedIds = new Set(
    prioritizedTemplates.map((template) => template.id),
  );

  return [
    ...prioritizedTemplates,
    ...rankedTemplates.filter((template) => !prioritizedIds.has(template.id)),
  ].slice(0, stitchrCandidateCount);
}
