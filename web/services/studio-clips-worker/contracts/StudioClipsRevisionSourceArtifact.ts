import type { StudioClipsSourceArtifact } from "./StudioClipsSourceArtifact";

export type StudioClipsRevisionSourceArtifact = StudioClipsSourceArtifact & {
  sourceOutputId: string;
};
