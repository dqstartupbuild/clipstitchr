import type { LazyReelToolKey } from "./LazyReelToolKey";
import type { LazyReelWorkflowKey } from "./LazyReelWorkflowKey";

export type LazyReelResearchJobSelection =
  | { kind: "tool"; key: LazyReelToolKey }
  | { kind: "workflow"; key: LazyReelWorkflowKey };
