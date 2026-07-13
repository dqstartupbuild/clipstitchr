import type { RawCampaignAsset } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/RawCampaignAsset";
import type { RawCampaignPlan } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/RawCampaignPlan";

export function createRawCampaignPlanMarkdown(
  plan: RawCampaignPlan,
  assets: readonly RawCampaignAsset[],
): string {
  const lines = [
    "# Raw Clips to Campaign Plan",
    "",
    `Coverage: ${plan.coveragePercent.toFixed(0)}% across ${plan.assetCount} named assets`,
    "",
    "## Asset inventory",
    ...assets
      .filter((asset) => asset.name.trim())
      .slice(0, 24)
      .map(
        (asset) =>
          `- ${asset.name.trim()} (${asset.role})${asset.tags.trim() ? ` — ${asset.tags.trim()}` : ""}`,
      ),
    "",
    "## Campaign concepts",
    ...(plan.concepts.length
      ? plan.concepts.flatMap((concept, index) => [
          `### ${index + 1}. ${concept.title}`,
          `- Compatibility: ${concept.compatibilityScore}/100`,
          `- Hook: ${concept.hook.name}`,
          `- Body: ${concept.body.name}`,
          `- Proof: ${concept.proof?.name ?? "Capture needed"}`,
          `- CTA: ${concept.cta?.name ?? "Capture needed"}`,
          `- Shared tags: ${concept.sharedTags.join(", ") || "None entered"}`,
          "",
        ])
      : ["- Add at least one hook and one UGC or demo body clip.", ""]),
    "## Missing captures",
    ...(plan.missingCaptures.length
      ? plan.missingCaptures.map((item) => `- ${item}`)
      : ["- No required role gaps found in this text inventory."]),
    "",
    "## Reuse map",
    ...plan.reuse.map(
      (item) =>
        `- ${item.assetName}: ${item.useCount} concept${item.useCount === 1 ? "" : "s"}`,
    ),
    "",
    "Planning note: Compatibility is based on role coverage and repeated tags, not predicted ad performance.",
  ];

  return lines.join("\n");
}
