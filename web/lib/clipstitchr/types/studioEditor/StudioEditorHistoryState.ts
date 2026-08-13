import type { StudioEditorProjectV1 } from "./StudioEditorProjectV1";

export type StudioEditorHistoryState = {
  past: StudioEditorProjectV1[];
  present: StudioEditorProjectV1;
  future: StudioEditorProjectV1[];
  limit: number;
};
