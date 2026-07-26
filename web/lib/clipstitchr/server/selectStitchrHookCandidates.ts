import { getStitchrHookTemplateRelevanceScore } from "@/lib/clipstitchr/server/getStitchrHookTemplateRelevanceScore";
import { getStitchrHookVariationIndex } from "@/lib/clipstitchr/server/getStitchrHookVariationIndex";
import { getUgcDiscoveryHookCoordinates } from "@/lib/clipstitchr/server/getUgcDiscoveryHookCoordinates";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { StitchrTextGenerationClipContext } from "@/lib/clipstitchr/types/StitchrTextGenerationClipContext";
import { getSeededIndex } from "@/lib/clipstitchr/utils/getSeededIndex";

const stitchrCandidateCount = 18;
const stitchrDiscoveryCandidateCount = 12;
const maximumCandidatesPerStyle = 3;
const maximumDiscoveryCandidatesPerFamily = 4;
const seededSortRange = 2_147_483_647;
const initialAssignedFamilyByOpenerIndex = [0, 1, 2, 1, 0, 1, 2, 2, 0, 1];

export function selectStitchrHookCandidates({
  clipContexts,
  product,
  templates,
  variationSeed,
}: {
  clipContexts: StitchrTextGenerationClipContext[];
  product: ProductProfile;
  templates: CliprHookTemplate[];
  variationSeed?: string;
}) {
  const resolvedVariationSeed =
    variationSeed?.trim() ||
    [product.id, ...clipContexts.map((context) => context.id)].join(":");
  const variationIndex = getStitchrHookVariationIndex(resolvedVariationSeed);
  const assignedOpenerIndex = variationIndex % 10;
  const assignedFamilyIndex =
    ((initialAssignedFamilyByOpenerIndex[assignedOpenerIndex] ?? 0) +
      Math.floor(variationIndex / 10)) %
    3;
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
    const seededDifference =
      getSeededIndex(`${resolvedVariationSeed}:${left.id}`, seededSortRange) -
      getSeededIndex(`${resolvedVariationSeed}:${right.id}`, seededSortRange);

    return (
      scoreDifference || seededDifference || left.id.localeCompare(right.id)
    );
  });
  const assignedDiscoveryTemplate = rankedTemplates.find((template) => {
    if (template.source !== "ugc_discovery_patterns") {
      return false;
    }

    const coordinates = getUgcDiscoveryHookCoordinates(template.id);

    return (
      coordinates?.familyIndex === assignedFamilyIndex &&
      coordinates.openerIndex === assignedOpenerIndex
    );
  });
  const discoveryStyleCounts = new Map<string, number>();
  const discoveryFamilyCounts = new Map<number, number>();
  const discoveryOpenerKeys = new Set<string>();
  const discoveryTemplates: CliprHookTemplate[] = [];

  if (assignedDiscoveryTemplate) {
    const coordinates = getUgcDiscoveryHookCoordinates(
      assignedDiscoveryTemplate.id,
    );

    discoveryTemplates.push(assignedDiscoveryTemplate);
    discoveryStyleCounts.set(assignedDiscoveryTemplate.styleKey, 1);

    if (coordinates) {
      discoveryFamilyCounts.set(coordinates.familyIndex, 1);
      discoveryOpenerKeys.add(
        `${coordinates.familyIndex}:${coordinates.openerIndex}`,
      );
    }
  }

  for (const template of rankedTemplates) {
    if (
      discoveryTemplates.length >= stitchrDiscoveryCandidateCount ||
      template.source !== "ugc_discovery_patterns" ||
      discoveryTemplates.some((candidate) => candidate.id === template.id)
    ) {
      continue;
    }

    const coordinates = getUgcDiscoveryHookCoordinates(template.id);
    const currentStyleCount = discoveryStyleCounts.get(template.styleKey) ?? 0;
    const currentFamilyCount = coordinates
      ? (discoveryFamilyCounts.get(coordinates.familyIndex) ?? 0)
      : 0;
    const openerKey = coordinates
      ? `${coordinates.familyIndex}:${coordinates.openerIndex}`
      : template.id;

    if (
      currentStyleCount >= maximumCandidatesPerStyle ||
      currentFamilyCount >= maximumDiscoveryCandidatesPerFamily ||
      discoveryOpenerKeys.has(openerKey)
    ) {
      continue;
    }

    discoveryTemplates.push(template);
    discoveryStyleCounts.set(template.styleKey, currentStyleCount + 1);
    discoveryOpenerKeys.add(openerKey);

    if (coordinates) {
      discoveryFamilyCounts.set(
        coordinates.familyIndex,
        currentFamilyCount + 1,
      );
    }
  }

  for (const template of rankedTemplates) {
    if (
      discoveryTemplates.length >= stitchrDiscoveryCandidateCount ||
      template.source !== "ugc_discovery_patterns" ||
      discoveryTemplates.some((candidate) => candidate.id === template.id)
    ) {
      continue;
    }

    const currentStyleCount = discoveryStyleCounts.get(template.styleKey) ?? 0;

    if (currentStyleCount >= maximumCandidatesPerStyle) {
      continue;
    }

    discoveryTemplates.push(template);
    discoveryStyleCounts.set(template.styleKey, currentStyleCount + 1);
  }

  const selectedIds = new Set(
    discoveryTemplates.map((template) => template.id),
  );
  const styleCounts = new Map(discoveryStyleCounts);

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
