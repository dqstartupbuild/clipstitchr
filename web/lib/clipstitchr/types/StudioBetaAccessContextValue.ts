import type { StudioBetaAccessState } from "./StudioBetaAccessState";

export type StudioBetaAccessContextValue = StudioBetaAccessState & {
  isLoading: boolean;
};
