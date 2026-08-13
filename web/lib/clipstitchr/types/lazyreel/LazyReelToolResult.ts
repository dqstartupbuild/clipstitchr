import type { LazyReelEvidence } from "./LazyReelEvidence";
import type { LazyReelResultLink } from "./LazyReelResultLink";
import type { LazyReelResultSection } from "./LazyReelResultSection";
import type { LazyReelToolKey } from "./LazyReelToolKey";

export type LazyReelToolResult<TData = unknown> = {
  data: TData;
  evidence: LazyReelEvidence[];
  limitations: string[];
  links: LazyReelResultLink[];
  methodology: string;
  sections: LazyReelResultSection[];
  summary: string;
  title: string;
  tool: LazyReelToolKey;
};
