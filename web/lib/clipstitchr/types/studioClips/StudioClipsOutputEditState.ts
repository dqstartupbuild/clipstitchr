import type { StudioClipsCaptionStyle } from "./StudioClipsCaptionStyle";
import type { StudioClipsOutputHandoff } from "./StudioClipsOutputHandoff";

export type StudioClipsOutputEditState = {
  acceptance: {
    state: "accepted" | "pending" | "rejected";
    updatedAt?: string;
  };
  captions?: {
    burnIn: boolean;
    enabled: boolean;
    languageCode?: string;
    style?: StudioClipsCaptionStyle;
    styleSnapshotJson?: string;
  };
  handoffs: StudioClipsOutputHandoff[];
  merge?: {
    outputIds: string[];
  };
  projectStyle?: {
    snapshotJson: string;
    snapshotVersion: 1;
  };
  regenerate: {
    instructions?: string;
    state: "not_requested" | "requested";
    updatedAt?: string;
  };
  split?: {
    pointsSeconds: number[];
  };
  trim?: {
    endSeconds: number;
    startSeconds: number;
  };
  version: 1;
};
