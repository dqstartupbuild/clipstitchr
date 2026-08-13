import type { LazyReelEvidence } from "./LazyReelEvidence";
import type { LazyReelResultLink } from "./LazyReelResultLink";
import type { LazyReelResultSection } from "./LazyReelResultSection";
import type { LazyReelWorkflowKey } from "./LazyReelWorkflowKey";
import type { LazyReelWorkflowResultData } from "./LazyReelWorkflowResultData";

export type LazyReelWorkflowResult = {
  data: LazyReelWorkflowResultData;
  evidence: LazyReelEvidence[];
  limitations: string[];
  links: LazyReelResultLink[];
  methodology: string;
  sections: LazyReelResultSection[];
  summary: string;
  title: string;
  workflow: LazyReelWorkflowKey;
};
