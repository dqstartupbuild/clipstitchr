import type { StudioBetaAccessState } from "./StudioBetaAccessState";

export type StudioBetaServerAccessState = StudioBetaAccessState & {
  isAuthenticated: boolean;
  userId: string | null;
};
