import type { LazyReelEvidenceKind } from "./LazyReelEvidenceKind";

export type LazyReelEvidence = {
  detail: string;
  kind: LazyReelEvidenceKind;
  label: string;
  sample?: number;
  snapshotVersion: string;
  source: string;
};
