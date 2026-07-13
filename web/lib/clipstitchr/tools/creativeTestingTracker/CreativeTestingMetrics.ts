import type { CreativeTestingMetric } from "@/lib/clipstitchr/tools/creativeTestingTracker/CreativeTestingMetric";

export type CreativeTestingMetrics = {
  cpa: CreativeTestingMetric;
  cpi: CreativeTestingMetric;
  ctr: CreativeTestingMetric;
  installRate: CreativeTestingMetric;
};
