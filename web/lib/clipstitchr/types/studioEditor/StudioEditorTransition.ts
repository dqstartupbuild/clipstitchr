export type StudioEditorTransition = {
  kind: "none" | "crossfade" | "dipToBlack" | "dipToWhite";
  durationSeconds: number;
};
