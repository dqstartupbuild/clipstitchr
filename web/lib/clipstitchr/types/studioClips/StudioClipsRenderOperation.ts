import type { StudioClipsCaptionStyle } from "./StudioClipsCaptionStyle";
import type { StudioClipsPlatformPreset } from "./StudioClipsPlatformPreset";

export type StudioClipsRenderOperation =
  | { endSeconds: number; kind: "trim"; startSeconds: number }
  | { kind: "split"; pointsSeconds: number[] }
  | { kind: "merge"; outputIds: string[] }
  | {
      burnIn: boolean;
      enabled: boolean;
      kind: "captions";
      languageCode?: string;
      style?: StudioClipsCaptionStyle;
      styleSnapshotJson?: string;
    }
  | { kind: "project_style"; style: StudioClipsCaptionStyle }
  | { instructions?: string; kind: "regenerate" }
  | { kind: "platform_export"; preset: StudioClipsPlatformPreset };
