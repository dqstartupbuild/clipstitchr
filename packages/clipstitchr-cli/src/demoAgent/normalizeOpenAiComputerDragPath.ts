import type { OpenAiComputerAction } from "./OpenAiComputerAction.js";

export function normalizeOpenAiComputerDragPath(
  path: Extract<OpenAiComputerAction, { type: "drag" }>["path"],
) {
  return path.map((point) => {
    if (Array.isArray(point)) {
      return { x: point[0], y: point[1] };
    }

    return point;
  });
}
