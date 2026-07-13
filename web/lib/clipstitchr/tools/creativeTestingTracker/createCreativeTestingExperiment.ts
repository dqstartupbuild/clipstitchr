import type { CreativeTestingExperiment } from "@/lib/clipstitchr/tools/creativeTestingTracker/CreativeTestingExperiment";

export function createCreativeTestingExperiment(
  index: number,
): CreativeTestingExperiment {
  return {
    channel: index % 2 === 0 ? "Instagram Reels" : "TikTok",
    clicks: 0,
    conversions: 0,
    cta: "",
    hook: "",
    id: `experiment-${index}`,
    impressions: 0,
    installs: 0,
    spend: 0,
    visual: "",
  };
}
