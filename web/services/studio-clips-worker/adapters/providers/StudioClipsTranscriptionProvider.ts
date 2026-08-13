import type { StudioClipsTranscriptArtifact } from "../../contracts/StudioClipsTranscriptArtifact";

export type StudioClipsTranscriptionProvider = {
  transcribe: (input: { audioPath: string }) => Promise<StudioClipsTranscriptArtifact>;
};
