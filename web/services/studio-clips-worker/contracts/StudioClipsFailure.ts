import type { StudioClipsFailureKind } from "./StudioClipsFailureKind";

export type StudioClipsFailure = {
  code: string;
  kind: StudioClipsFailureKind;
  message: string;
};
