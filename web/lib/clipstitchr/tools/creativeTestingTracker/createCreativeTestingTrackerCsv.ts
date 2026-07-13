import type { CreativeTestingExperiment } from "@/lib/clipstitchr/tools/creativeTestingTracker/CreativeTestingExperiment";
import { calculateCreativeTestingMetrics } from "@/lib/clipstitchr/tools/creativeTestingTracker/calculateCreativeTestingMetrics";
import { formatCreativeTestingMetric } from "@/lib/clipstitchr/tools/creativeTestingTracker/formatCreativeTestingMetric";
import { createCsvText } from "@/lib/clipstitchr/tools/csv/createCsvText";

export function createCreativeTestingTrackerCsv(
  experiments: readonly CreativeTestingExperiment[],
) {
  return createCsvText([
    [
      "Channel",
      "Hook",
      "Visual",
      "CTA",
      "Spend",
      "Impressions",
      "Clicks",
      "Installs",
      "Conversions",
      "CTR",
      "Install rate",
      "CPI",
      "CPA",
    ],
    ...experiments.map((experiment) => {
      const metrics = calculateCreativeTestingMetrics(experiment);

      return [
        experiment.channel,
        experiment.hook,
        experiment.visual,
        experiment.cta,
        experiment.spend.toFixed(2),
        String(experiment.impressions),
        String(experiment.clicks),
        String(experiment.installs),
        String(experiment.conversions),
        formatCreativeTestingMetric(metrics.ctr, "percentage"),
        formatCreativeTestingMetric(metrics.installRate, "percentage"),
        formatCreativeTestingMetric(metrics.cpi, "currency"),
        formatCreativeTestingMetric(metrics.cpa, "currency"),
      ];
    }),
  ]);
}
