import type { StudioBetaWorkspaceMediaCard } from "./StudioBetaWorkspaceMediaCard";

export type StudioBetaWorkspaceSummary = {
  productName: string;
  recentMedia: StudioBetaWorkspaceMediaCard[];
  sourceCount: number;
  stitchCount: number;
};
