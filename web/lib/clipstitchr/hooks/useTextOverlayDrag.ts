"use client";

import {
  useCallback,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";
import { getTextOverlayStyle } from "@/lib/clipstitchr/utils/getTextOverlayStyle";

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
        let nextX = startX + (moveEvent.clientX - startPointerX) / stageRect.width;
        let nextY =
          startY + (moveEvent.clientY - startPointerY) / stageRect.height;
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

      const handlePointerUp = () => {
        onSnapGuidesChange({ vertical: false, horizontal: false });
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
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
