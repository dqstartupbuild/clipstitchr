export type RecordingInteractionEvent = {
  type: "click" | "mousemove";
  timestampMs: number;
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
};
