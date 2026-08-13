import type { StudioClipsAnalysisArtifact } from "./StudioClipsAnalysisArtifact";
import type { StudioClipsBrollArtifact } from "./StudioClipsBrollArtifact";
import type { StudioClipsDurableOutput } from "./StudioClipsDurableOutput";
import type { StudioClipsMediaProbe } from "./StudioClipsMediaProbe";
import type { StudioClipsRenderArtifact } from "./StudioClipsRenderArtifact";
import type { StudioClipsSourceArtifact } from "./StudioClipsSourceArtifact";
import type { StudioClipsTranscriptArtifact } from "./StudioClipsTranscriptArtifact";
import type { StudioClipsRevisionSourceArtifact } from "./StudioClipsRevisionSourceArtifact";

export type StudioClipsPipelineState = {
  analysis?: StudioClipsAnalysisArtifact;
  broll?: StudioClipsBrollArtifact[];
  media?: StudioClipsMediaProbe;
  mediaList?: StudioClipsMediaProbe[];
  outputs?: StudioClipsDurableOutput[];
  renders?: StudioClipsRenderArtifact[];
  source?: StudioClipsSourceArtifact;
  sources?: StudioClipsRevisionSourceArtifact[];
  transcript?: StudioClipsTranscriptArtifact;
};
