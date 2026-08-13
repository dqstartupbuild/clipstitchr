import type { StudioEditorCaptionLayer } from "./StudioEditorCaptionLayer";
import type { StudioEditorImageLayer } from "./StudioEditorImageLayer";
import type { StudioEditorMusicLayer } from "./StudioEditorMusicLayer";
import type { StudioEditorTextLayer } from "./StudioEditorTextLayer";
import type { StudioEditorVideoLayer } from "./StudioEditorVideoLayer";
import type { StudioEditorVoiceLayer } from "./StudioEditorVoiceLayer";

export type StudioEditorLayer =
  | StudioEditorVideoLayer
  | StudioEditorImageLayer
  | StudioEditorTextLayer
  | StudioEditorVoiceLayer
  | StudioEditorMusicLayer
  | StudioEditorCaptionLayer;
