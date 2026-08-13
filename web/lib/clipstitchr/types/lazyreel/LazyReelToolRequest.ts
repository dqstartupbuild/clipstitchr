import type { LazyReelBreakoutLawsRequest } from "./LazyReelBreakoutLawsRequest";
import type { LazyReelGetStatusRequest } from "./LazyReelGetStatusRequest";
import type { LazyReelKillTheSlopRequest } from "./LazyReelKillTheSlopRequest";
import type { LazyReelMakeBriefRequest } from "./LazyReelMakeBriefRequest";
import type { LazyReelNicheReportRequest } from "./LazyReelNicheReportRequest";
import type { LazyReelStudyVideosRequest } from "./LazyReelStudyVideosRequest";
import type { LazyReelTeardownRequest } from "./LazyReelTeardownRequest";

export type LazyReelToolRequest =
  | LazyReelNicheReportRequest
  | LazyReelStudyVideosRequest
  | LazyReelTeardownRequest
  | LazyReelMakeBriefRequest
  | LazyReelBreakoutLawsRequest
  | LazyReelKillTheSlopRequest
  | LazyReelGetStatusRequest;
