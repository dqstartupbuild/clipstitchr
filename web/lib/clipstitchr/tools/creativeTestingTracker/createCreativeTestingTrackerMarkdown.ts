import type { CreativeTestingExperiment } from "@/lib/clipstitchr/tools/creativeTestingTracker/CreativeTestingExperiment";
import { calculateCreativeTestingMetrics } from "@/lib/clipstitchr/tools/creativeTestingTracker/calculateCreativeTestingMetrics";
import { formatCreativeTestingMetric } from "@/lib/clipstitchr/tools/creativeTestingTracker/formatCreativeTestingMetric";

export function createCreativeTestingTrackerMarkdown(
  experiments: readonly CreativeTestingExperiment[],
) {
  const sections = experiments.map((experiment, index) => {
    const metrics = calculateCreativeTestingMetrics(experiment);

    return [
      `## Experiment ${index + 1}: ${experiment.channel}`,
      `- Hook: ${experiment.hook || "Not entered"}`,
      `- Visual: ${experiment.visual || "Not entered"}`,
      `- CTA: ${experiment.cta || "Not entered"}`,
      `- Spend: $${experiment.spend.toFixed(2)}`,
      `- Impressions / clicks / installs / conversions: ${experiment.impressions} / ${experiment.clicks} / ${experiment.installs} / ${experiment.conversions}`,
      `- CTR: ${formatCreativeTestingMetric(metrics.ctr, "percentage")}`,
      `- Install rate: ${formatCreativeTestingMetric(metrics.installRate, "percentage")}`,
      `- CPI: ${formatCreativeTestingMetric(metrics.cpi, "currency")}`,
      `- CPA: ${formatCreativeTestingMetric(metrics.cpa, "currency")}`,
    ].join("\n");
  });

  return [
    "# TikTok and Reels Creative Testing Tracker",
    "",
    "These figures use only the manually entered rows. They are not platform attribution.",
    "",
    ...sections.flatMap((section) => [section, ""]),
  ]
    .join("\n")
    .trim();
}
