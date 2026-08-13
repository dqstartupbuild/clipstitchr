import type { LazyReelNicheReportFocus } from "./LazyReelNicheReportFocus";

export type LazyReelNicheReportRequest = {
  focus?: LazyReelNicheReportFocus;
  limit?: number;
  niche?: string;
  tool: "niche_report";
};
