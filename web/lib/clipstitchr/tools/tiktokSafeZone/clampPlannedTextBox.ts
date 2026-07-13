import type { PlannedTextBox } from "@/lib/clipstitchr/tools/tiktokSafeZone/PlannedTextBox";

export function clampPlannedTextBox(
  box: PlannedTextBox,
  nextX: number,
  nextY: number,
): PlannedTextBox {
  return {
    ...box,
    x: Math.min(Math.max(nextX, 0), 1 - box.width),
    y: Math.min(Math.max(nextY, 0), 1 - box.height),
  };
}
