"use client";

import {
  useCallback,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import type { TextOverlay } from "@/lib/clipr/types/TextOverlay";
import { clampTextOverlay } from "@/lib/clipr/utils/clampTextOverlay";
import { getTextOverlayStyle } from "@/lib/clipr/utils/getTextOverlayStyle";

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
      const overlayStyle = getTextOverlayStyle(textOverlay.styleId);

      const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
        const widthDelta =
          (moveEvent.clientX - startPointerX) / stageRect.width;
        const heightDelta =
          (moveEvent.clientY - event.clientY) / stageRect.height;
        const nextWidth = startWidth + widthDelta;
        const fontScale = 1 + widthDelta * 0.55 + heightDelta * 1.2;

        onChange(
          clampTextOverlay(
            {
              ...textOverlay,
              width: overlayStyle.fullWidthBand ? textOverlay.width : nextWidth,
              fontSize: startFontSize * fontScale,
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
