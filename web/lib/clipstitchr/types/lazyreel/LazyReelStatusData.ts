import type { LazyReelToolKey } from "./LazyReelToolKey";
import type { LazyReelWorkflowKey } from "./LazyReelWorkflowKey";

export type LazyReelStatusData = {
  capabilities: string[];
  counts: {
    analyzedVideos: number;
    breakoutTeardowns: number;
    decodedVideosClaimed: number;
    exampleLinks: number;
    trendingTags: number;
    visuallyAnalyzed: number;
  };
  liveTools: LazyReelToolKey[];
  snapshotVersion: string;
  workflows: LazyReelWorkflowKey[];
};
