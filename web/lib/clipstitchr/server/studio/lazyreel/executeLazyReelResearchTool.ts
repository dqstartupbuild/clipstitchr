import type { LazyReelToolRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelToolRequest";
import type { LazyReelToolResult } from "@/lib/clipstitchr/types/lazyreel/LazyReelToolResult";
import { assertNeverLazyReelTool } from "./assertNeverLazyReelTool";
import { executeLazyReelBreakoutLaws } from "./executeLazyReelBreakoutLaws";
import { executeLazyReelGetStatus } from "./executeLazyReelGetStatus";
import { executeLazyReelKillTheSlop } from "./executeLazyReelKillTheSlop";
import { executeLazyReelMakeBrief } from "./executeLazyReelMakeBrief";
import { executeLazyReelNicheReport } from "./executeLazyReelNicheReport";
import { executeLazyReelStudyVideos } from "./executeLazyReelStudyVideos";
import { executeLazyReelTeardown } from "./executeLazyReelTeardown";

export function executeLazyReelResearchTool(
  request: LazyReelToolRequest,
): LazyReelToolResult {
  switch (request.tool) {
    case "niche_report":
      return executeLazyReelNicheReport(request);
    case "study_videos":
      return executeLazyReelStudyVideos(request);
    case "teardown":
      return executeLazyReelTeardown(request);
    case "make_brief":
      return executeLazyReelMakeBrief(request);
    case "breakout_laws":
      return executeLazyReelBreakoutLaws();
    case "kill_the_slop":
      return executeLazyReelKillTheSlop(request);
    case "get_status":
      return executeLazyReelGetStatus();
    default:
      return assertNeverLazyReelTool(request);
  }
}
