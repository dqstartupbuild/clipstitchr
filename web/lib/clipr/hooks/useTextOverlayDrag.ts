"use client";

import {
  useCallback,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import type { TextOverlay } from "@/lib/clipr/types/TextOverlay";
import { clampTextOverlay } from "@/lib/clipr/utils/clampTextOverlay";

type UseTextOverlayDragOptions = {
  textOverlay: TextOverlay;
  stageRef: RefObject<HTMLDivElement | null>;
  totalDuration: number;
  onChange: (textOverlay: TextOverlay) => void;
};

export function useTextOverlayDrag({
  textOverlay,
  stageRef,
  totalDuration,
  onChange,
}: UseTextOverlayDragOptions) {
  return useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return;
      }

      const stage = stageRef.current;

      if (!stage) {
        return;
      }

      event.preventDefault();

      const stageRect = stage.getBoundingClientRect();
      const startPointerX = event.clientX;
      const startPointerY = event.clientY;
      const startX = textOverlay.x;
      const startY = textOverlay.y;

      const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
        const nextX = startX + (moveEvent.clientX - startPointerX) / stageRect.width;
        const nextY =
          startY + (moveEvent.clientY - startPointerY) / stageRect.height;

        onChange(
          clampTextOverlay(
            {
              ...textOverlay,
              x: nextX,
              y: nextY,
            },
            totalDuration,
          ),
        );
      };

      const handlePointerUp = () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
    [onChange, stageRef, textOverlay, totalDuration],
  );
}
