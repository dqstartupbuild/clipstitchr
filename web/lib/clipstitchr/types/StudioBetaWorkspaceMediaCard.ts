import type { R2ObjectReference } from "./R2ObjectReference";

export type StudioBetaWorkspaceMediaCard = {
  createdAt: string;
  duration: number;
  id: string;
  kind: "source" | "stitch";
  name: string;
  posterObject?: R2ObjectReference;
};
