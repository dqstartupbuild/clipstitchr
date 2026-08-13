import type { MouseEvent } from "react";

export function seekStudioEditorTimelineTrack(
  event: MouseEvent<HTMLDivElement>,
  durationSeconds: number,
  onSeek: (seconds: number) => void,
) {
  const bounds = event.currentTarget.getBoundingClientRect();
  const ratio = Math.max(
    0,
    Math.min(1, (event.clientX - bounds.left) / bounds.width),
  );
  onSeek(ratio * durationSeconds);
}
