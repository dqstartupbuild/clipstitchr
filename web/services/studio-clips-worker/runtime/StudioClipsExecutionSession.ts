import type { StudioClipsWorkerDependencies } from "../contracts/StudioClipsWorkerDependencies";
import type { StudioClipsCompletionEvidence } from "./StudioClipsCompletionEvidence";

export type StudioClipsExecutionSession = {
  dependencies: StudioClipsWorkerDependencies;
  evidence: StudioClipsCompletionEvidence;
};
