import type { StudioClipsAnalysisArtifact } from "../../contracts/StudioClipsAnalysisArtifact";
import type { StudioClipsInitialClaimEnvelope } from "../../contracts/StudioClipsInitialClaimEnvelope";

export type StudioClipsAnalysisProvider = {
  analyze: (input: {
    claim: StudioClipsInitialClaimEnvelope;
    durationSeconds: number;
    transcript: string;
  }) => Promise<StudioClipsAnalysisArtifact>;
};
