"use client";

import { useRef } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { clampPlannedTextBox } from "@/lib/clipstitchr/tools/tiktokSafeZone/clampPlannedTextBox";
import type { PlannedTextBox } from "@/lib/clipstitchr/tools/tiktokSafeZone/PlannedTextBox";

type SafeZonePlannedTextBoxProps = {
  box: PlannedTextBox;
  isClear: boolean;
  onChange: (box: PlannedTextBox) => void;
};

type DragStart = {
  clientX: number;
  clientY: number;
  x: number;
  y: number;
};

export function SafeZonePlannedTextBox({
  box,
  isClear,
  onChange,
}: SafeZonePlannedTextBoxProps) {
  const dragStart = useRef<DragStart | null>(null);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      x: box.x,
      y: box.y,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;
    const preview = event.currentTarget.parentElement;
    if (!start || !preview) return;
    const bounds = preview.getBoundingClientRect();
    onChange(
      clampPlannedTextBox(
        box,
        start.x + (event.clientX - start.clientX) / bounds.width,
        start.y + (event.clientY - start.clientY) / bounds.height,
      ),
    );
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    dragStart.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const amount = event.shiftKey ? 0.05 : 0.01;
    const movements: Record<string, [number, number]> = {
      ArrowDown: [0, amount],
      ArrowLeft: [-amount, 0],
      ArrowRight: [amount, 0],
      ArrowUp: [0, -amount],
    };
    const movement = movements[event.key];
    if (!movement) return;
    event.preventDefault();
    onChange(
      clampPlannedTextBox(box, box.x + movement[0], box.y + movement[1]),
    );
  };

  return (
    <div
      aria-label="Planned text position. Drag it or use arrow keys to move it."
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(box.y * 100)}
      aria-valuetext={`Horizontal ${Math.round(box.x * 100)}%, vertical ${Math.round(box.y * 100)}%`}
      className={`absolute grid cursor-move touch-none select-none place-items-center rounded-md border-2 px-2 text-center text-xs font-black leading-4 text-white shadow-lg outline-none focus:ring-2 focus:ring-white ${
        isClear
          ? "border-emerald-300 bg-emerald-900/75"
          : "border-amber-200 bg-amber-950/80"
      }`}
      onKeyDown={handleKeyDown}
      onPointerCancel={handlePointerUp}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      role="slider"
      style={{
        height: `${box.height * 100}%`,
        left: `${box.x * 100}%`,
        top: `${box.y * 100}%`,
        width: `${box.width * 100}%`,
      }}
      tabIndex={0}
    >
      {box.text || "Your planned text"}
    </div>
  );
}
