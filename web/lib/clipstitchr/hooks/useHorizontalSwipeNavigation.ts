"use client";

import { useCallback, useRef, type TouchEventHandler } from "react";

type UseHorizontalSwipeNavigationOptions = {
  isEnabled: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
};

const SWIPE_MIN_DISTANCE = 48;
const SWIPE_MAX_VERTICAL_DISTANCE = 80;

export function useHorizontalSwipeNavigation({
  isEnabled,
  onSwipeLeft,
  onSwipeRight,
}: UseHorizontalSwipeNavigationOptions) {
  const startPositionRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback<TouchEventHandler<HTMLElement>>(
    (event) => {
      const target = event.target;

      if (
        !isEnabled ||
        !(target instanceof Element) ||
        target.closest("[data-swipe-ignore='true']")
      ) {
        startPositionRef.current = null;
        return;
      }

      const touch = event.touches[0];

      if (!touch) {
        startPositionRef.current = null;
        return;
      }

      startPositionRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    },
    [isEnabled],
  );

  const handleTouchEnd = useCallback<TouchEventHandler<HTMLElement>>(
    (event) => {
      const startPosition = startPositionRef.current;
      const touch = event.changedTouches[0];

      startPositionRef.current = null;

      if (!isEnabled || !startPosition || !touch) {
        return;
      }

      const deltaX = touch.clientX - startPosition.x;
      const deltaY = touch.clientY - startPosition.y;

      if (
        Math.abs(deltaX) < SWIPE_MIN_DISTANCE ||
        Math.abs(deltaY) > SWIPE_MAX_VERTICAL_DISTANCE
      ) {
        return;
      }

      if (deltaX < 0) {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
    },
    [isEnabled, onSwipeLeft, onSwipeRight],
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
}
