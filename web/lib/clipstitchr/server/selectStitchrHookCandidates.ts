import { getStitchrHookTemplateRelevanceScore } from "@/lib/clipstitchr/server/getStitchrHookTemplateRelevanceScore";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { StitchrTextGenerationClipContext } from "@/lib/clipstitchr/types/StitchrTextGenerationClipContext";

const stitchrCandidateCount = 18;
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
      (templateScores.get(right.id) ?? 0) -
      (templateScores.get(left.id) ?? 0);

    return scoreDifference || left.id.localeCompare(right.id);
  });
  const styleCounts = new Map<string, number>();
  const diversifiedTemplates = rankedTemplates.filter((template) => {
    const currentCount = styleCounts.get(template.styleKey) ?? 0;

    if (currentCount >= maximumCandidatesPerStyle) {
      return false;
    }

    styleCounts.set(template.styleKey, currentCount + 1);
    return true;
  });
  const selectedIds = new Set(
    diversifiedTemplates
      .slice(0, stitchrCandidateCount)
      .map((template) => template.id),
  );

  return [
    ...diversifiedTemplates,
    ...rankedTemplates.filter((template) => !selectedIds.has(template.id)),
  ].slice(0, stitchrCandidateCount);
}
