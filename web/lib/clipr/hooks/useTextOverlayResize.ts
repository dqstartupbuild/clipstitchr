"use client";

import {
  useCallback,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import type { TextOverlay } from "@/lib/clipr/types/TextOverlay";
import { clampTextOverlay } from "@/lib/clipr/utils/clampTextOverlay";

type UseTextOverlayResizeOptions = {
  textOverlay: TextOverlay;
  stageRef: RefObject<HTMLDivElement | null>;
  totalDuration: number;
  onChange: (textOverlay: TextOverlay) => void;
};

export function useTextOverlayResize({
  textOverlay,
  stageRef,
  totalDuration,
  onChange,
}: UseTextOverlayResizeOptions) {
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
      event.stopPropagation();

      const stageRect = stage.getBoundingClientRect();
      const startPointerX = event.clientX;
      const startWidth = textOverlay.width;
      const startFontSize = textOverlay.fontSize;

      const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
        const widthDelta =
          (moveEvent.clientX - startPointerX) / stageRect.width;
        const nextWidth = startWidth + widthDelta;
        const scale = nextWidth / startWidth;

        onChange(
          clampTextOverlay(
            {
              ...textOverlay,
              width: nextWidth,
              fontSize: startFontSize * scale,
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
