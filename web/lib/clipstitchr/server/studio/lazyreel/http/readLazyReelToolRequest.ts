import type { LazyReelToolRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelToolRequest";
import { readLazyReelKillTheSlopRequest } from "./readLazyReelKillTheSlopRequest";
import { readLazyReelMakeBriefRequest } from "./readLazyReelMakeBriefRequest";
import { readLazyReelNicheReportRequest } from "./readLazyReelNicheReportRequest";
import { readLazyReelObject } from "./readLazyReelObject";
import { readLazyReelStudyVideosRequest } from "./readLazyReelStudyVideosRequest";
import { readLazyReelTeardownRequest } from "./readLazyReelTeardownRequest";

export function readLazyReelToolRequest(value: unknown): LazyReelToolRequest {
  const request = readLazyReelObject(value, "Research request");

  switch (request.tool) {
    case "niche_report":
      return readLazyReelNicheReportRequest(request);
    case "study_videos":
      return readLazyReelStudyVideosRequest(request);
    case "teardown":
      return readLazyReelTeardownRequest(request);
    case "make_brief":
      return readLazyReelMakeBriefRequest(request);
    case "breakout_laws":
      return { tool: "breakout_laws" };
    case "kill_the_slop":
      return readLazyReelKillTheSlopRequest(request);
    case "get_status":
      return { tool: "get_status" };
    default:
      throw new Error("Choose a supported LazyReel research job.");
  }
}
