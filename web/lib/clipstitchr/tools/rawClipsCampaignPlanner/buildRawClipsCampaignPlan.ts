import type { RawCampaignAsset } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/RawCampaignAsset";
import type { RawCampaignConcept } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/RawCampaignConcept";
import type { RawCampaignPlan } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/RawCampaignPlan";
import { getRawCampaignSharedTags } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/getRawCampaignSharedTags";
import { rawCampaignAssetRoleLabels } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/rawCampaignAssetRoleLabels";
import { rawCampaignAssetRoles } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/rawCampaignAssetRoles";

export function buildRawClipsCampaignPlan(
  inputAssets: readonly RawCampaignAsset[],
): RawCampaignPlan {
  const assets = inputAssets
    .filter((asset) => asset.name.trim().length > 0)
    .slice(0, 24)
    .map((asset) => ({ ...asset, name: asset.name.trim() }));
  const byRole = Object.fromEntries(
    rawCampaignAssetRoles.map((role) => [
      role,
      assets.filter((asset) => asset.role === role),
    ]),
  ) as Record<(typeof rawCampaignAssetRoles)[number], RawCampaignAsset[]>;
  const bodies = [...byRole.ugc, ...byRole.demo];
  const candidates: RawCampaignConcept[] = [];

  for (const [hookIndex, hook] of byRole.hook.entries()) {
    for (const [bodyIndex, body] of bodies.entries()) {
      const conceptIndex = candidates.length;
      const proof = byRole.proof.length
        ? byRole.proof[(hookIndex + bodyIndex) % byRole.proof.length]
        : null;
      const cta = byRole.cta.length
        ? byRole.cta[(hookIndex * 2 + bodyIndex) % byRole.cta.length]
        : null;
      const selectedAssets = [hook, body, proof, cta].filter(
        (asset): asset is RawCampaignAsset => asset !== null,
      );
      const sharedTags = getRawCampaignSharedTags(selectedAssets);
      const stageScore = 30 + 30 + (proof ? 15 : 0) + (cta ? 15 : 0);

      candidates.push({
        body,
        compatibilityScore: Math.min(
          100,
          stageScore + Math.min(sharedTags.length * 5, 10),
        ),
        cta,
        hook,
        id: `concept-${conceptIndex + 1}`,
        proof,
        sharedTags,
        title: `${hook.name} + ${body.name}`,
      });
    }
  }

  const concepts = candidates.slice(0, 6);
  const usageCounts = new Map<string, number>();
  for (const concept of concepts) {
    for (const asset of [
      concept.hook,
      concept.body,
      concept.proof,
      concept.cta,
    ]) {
      if (asset) {
        usageCounts.set(asset.id, (usageCounts.get(asset.id) ?? 0) + 1);
      }
    }
  }
  const coverage = rawCampaignAssetRoles.map((role) => ({
    count: byRole[role].length,
    label: rawCampaignAssetRoleLabels[role],
    role,
  }));
  const missingCaptures = [
    ...(byRole.hook.length ? [] : ["Capture at least one hook or opening."]),
    ...(bodies.length
      ? []
      : ["Capture at least one UGC or product-demo body clip."]),
    ...(byRole.proof.length
      ? []
      : ["Capture one honest proof or outcome beat."]),
    ...(byRole.cta.length ? [] : ["Capture one clear call-to-action ending."]),
  ];

  return {
    assetCount: assets.length,
    concepts,
    coverage,
    coveragePercent:
      (coverage.filter((item) => item.count > 0).length / coverage.length) *
      100,
    missingCaptures,
    reuse: assets
      .map((asset) => ({
        assetId: asset.id,
        assetName: asset.name,
        useCount: usageCounts.get(asset.id) ?? 0,
      }))
      .filter((item) => item.useCount > 0)
      .sort(
        (itemA, itemB) =>
          itemB.useCount - itemA.useCount ||
          itemA.assetName.localeCompare(itemB.assetName),
      ),
  };
}
