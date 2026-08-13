import type { StudioClipsJsonValue } from "../contracts/StudioClipsJsonValue";
import type { StudioClipsMediaProbe } from "../contracts/StudioClipsMediaProbe";

export type StudioClipsStoredObjectProof = {
  etag: string;
  key: string;
  versionId?: string;
};

export type StudioClipsCompletionEvidenceSnapshot = {
  analysis?: StudioClipsJsonValue;
  renders: Record<
    string,
    {
      fileName: string;
      media?: StudioClipsMediaProbe;
    }
  >;
  storage: Record<string, StudioClipsStoredObjectProof>;
};

export type StudioClipsCompletionEvidence = {
  getAnalysis: () => StudioClipsJsonValue | undefined;
  getRender: (
    artifactId: string,
  ) => { fileName: string; media: StudioClipsMediaProbe } | undefined;
  recordAnalysis: (analysis: StudioClipsJsonValue) => void;
  recordRenderPath: (input: {
    artifactId: string;
    fileName: string;
    localPath: string;
  }) => void;
  recordStorageProof: (
    artifactId: string,
    proof: StudioClipsStoredObjectProof,
  ) => void;
  recordProbe: (localPath: string, media: StudioClipsMediaProbe) => void;
  restore: (snapshot: StudioClipsCompletionEvidenceSnapshot) => void;
  snapshot: () => StudioClipsCompletionEvidenceSnapshot;
};
