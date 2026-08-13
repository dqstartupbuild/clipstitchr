import type { StudioClipsCaptionStyle } from "./StudioClipsCaptionStyle";

export type StudioClipsOutputEditOperation =
  | {
      endSeconds: number;
      kind: "trim";
      startSeconds: number;
    }
  | {
      kind: "split";
      pointsSeconds: number[];
    }
  | {
      kind: "merge";
      outputIds: string[];
    }
  | {
      burnIn: boolean;
      enabled: boolean;
      kind: "captions";
      languageCode?: string;
      style?: StudioClipsCaptionStyle;
      styleSnapshotJson?: string;
    }
  | {
      kind: "project_style";
      snapshotJson: string;
    }
  | {
      instructions?: string;
      kind: "regenerate";
    }
  | {
      accepted: boolean;
      kind: "accept";
    }
  | {
      destination: "editor" | "library" | "stitchr";
      kind: "handoff";
      state: "cleared" | "requested";
    };
