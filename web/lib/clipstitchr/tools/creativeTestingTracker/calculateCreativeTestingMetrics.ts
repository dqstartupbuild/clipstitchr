import type { CreativeTestingExperiment } from "@/lib/clipstitchr/tools/creativeTestingTracker/CreativeTestingExperiment";
import type { CreativeTestingMetric } from "@/lib/clipstitchr/tools/creativeTestingTracker/CreativeTestingMetric";
import type { CreativeTestingMetrics } from "@/lib/clipstitchr/tools/creativeTestingTracker/CreativeTestingMetrics";

function unavailable(reason: string): CreativeTestingMetric {
  return { unavailableReason: reason, value: null };
}

function available(value: number): CreativeTestingMetric {
  return { unavailableReason: null, value };
}

export function calculateCreativeTestingMetrics(
  experiment: CreativeTestingExperiment,
): CreativeTestingMetrics {
  const spend = Math.max(
    0,
    Number.isFinite(experiment.spend) ? experiment.spend : 0,
  );
  const impressions = Math.max(
    0,
    Number.isFinite(experiment.impressions) ? experiment.impressions : 0,
  );
  const clicks = Math.max(
    0,
    Number.isFinite(experiment.clicks) ? experiment.clicks : 0,
  );
  const installs = Math.max(
    0,
    Number.isFinite(experiment.installs) ? experiment.installs : 0,
  );
  const conversions = Math.max(
    0,
    Number.isFinite(experiment.conversions) ? experiment.conversions : 0,
  );

  return {
    cpa:
      conversions > 0
        ? available(spend / conversions)
        : unavailable("Add conversions to calculate CPA"),
    cpi:
      installs > 0
        ? available(spend / installs)
        : unavailable("Add installs to calculate CPI"),
    ctr:
      impressions > 0
        ? available((clicks / impressions) * 100)
        : unavailable("Add impressions to calculate CTR"),
    installRate:
      clicks > 0
        ? available((installs / clicks) * 100)
        : unavailable("Add clicks to calculate install rate"),
  };
}
