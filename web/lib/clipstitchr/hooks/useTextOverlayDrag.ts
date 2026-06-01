"use client";

import {
  useCallback,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";
import { getTextOverlayStyle } from "@/lib/clipstitchr/utils/getTextOverlayStyle";

const MIN_DRAG_DISTANCE_PX = 4;

type TextOverlaySnapGuides = {
  vertical: boolean;
  horizontal: boolean;
};

type UseTextOverlayDragOptions = {
  textOverlay: TextOverlay;
  stageRef: RefObject<HTMLDivElement | null>;
  overlayRef: RefObject<HTMLDivElement | null>;
  totalDuration: number;
  onChange: (textOverlay: TextOverlay) => void;
  onSnapGuidesChange: (snapGuides: TextOverlaySnapGuides) => void;
};

export function useTextOverlayDrag({
  textOverlay,
  stageRef,
  overlayRef,
  totalDuration,
  onChange,
  onSnapGuidesChange,
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

      const dragTarget = event.currentTarget;

      dragTarget?.setPointerCapture?.(event.pointerId);

      const stageRect = stage.getBoundingClientRect();
      const overlayRect = overlayRef.current?.getBoundingClientRect();
      const overlayStyle = getTextOverlayStyle(textOverlay.styleId);
      const overlayWidth = overlayStyle.fullWidthBand ? 1 : textOverlay.width;
      const overlayHeight = overlayRect
        ? overlayRect.height / stageRect.height
        : 0;
      const snapThresholdX = 12 / stageRect.width;
      const snapThresholdY = 12 / stageRect.height;
      const startPointerX = event.clientX;
      const startPointerY = event.clientY;
      const startX = textOverlay.x;
      const startY = textOverlay.y;

      const handlePointerMove = (moveEvent: globalThis.PointerEvent) => {
        const pointerDeltaX = moveEvent.clientX - startPointerX;
        const pointerDeltaY = moveEvent.clientY - startPointerY;

        if (
          Math.hypot(pointerDeltaX, pointerDeltaY) < MIN_DRAG_DISTANCE_PX
        ) {
          return;
        }

        let nextX = startX + pointerDeltaX / stageRect.width;
        let nextY = startY + pointerDeltaY / stageRect.height;
        const isNearVerticalCenter =
          !overlayStyle.fullWidthBand &&
          Math.abs(nextX + overlayWidth / 2 - 0.5) <= snapThresholdX;
        const isNearHorizontalCenter =
          overlayHeight > 0 &&
          Math.abs(nextY + overlayHeight / 2 - 0.5) <= snapThresholdY;

        if (isNearVerticalCenter) {
          nextX = 0.5 - overlayWidth / 2;
        }

        if (isNearHorizontalCenter) {
          nextY = 0.5 - overlayHeight / 2;
        }

        onSnapGuidesChange({
          vertical: isNearVerticalCenter,
          horizontal: isNearHorizontalCenter,
        });

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

      const removeListeners = () => {
        onSnapGuidesChange({ vertical: false, horizontal: false });
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointercancel", removeListeners);
      };

      const handlePointerUp = (upEvent: globalThis.PointerEvent) => {
        if (dragTarget?.hasPointerCapture?.(upEvent.pointerId)) {
          dragTarget.releasePointerCapture(upEvent.pointerId);
        }

        removeListeners();
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", removeListeners);
    },
    [
      onChange,
      onSnapGuidesChange,
      overlayRef,
      stageRef,
      textOverlay,
      totalDuration,
    ],
  );
}
