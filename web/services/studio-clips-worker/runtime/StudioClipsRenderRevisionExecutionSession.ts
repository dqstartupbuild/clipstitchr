import type { StudioClipsRenderRevisionDependencies } from "../contracts/StudioClipsRenderRevisionDependencies";
import type { StudioClipsCompletionEvidence } from "./StudioClipsCompletionEvidence";

export type StudioClipsRenderRevisionExecutionSession = {
  dependencies: StudioClipsRenderRevisionDependencies;
  evidence: StudioClipsCompletionEvidence;
};
