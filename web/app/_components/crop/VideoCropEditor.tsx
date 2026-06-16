"use client";

import { RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/app/_components/ui/Button";
import type { QuickEditCrop } from "@/lib/clipstitchr/types/QuickEditCrop";
import { getQuickEditCropTransform } from "@/lib/clipstitchr/utils/getQuickEditCropTransform";

type VideoCropEditorProps = {
  crop: QuickEditCrop;
  label: string;
  mediaSrc: string | null;
  posterSrc?: string | null;
  onChange: (crop: QuickEditCrop) => void;
  onReset: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function VideoCropEditor({
  crop,
  label,
  mediaSrc,
  posterSrc,
  onChange,
  onReset,
}: VideoCropEditorProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    positionX: number;
    positionY: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const positionX = crop.positionX ?? 0;
  const positionY = crop.positionY ?? 0;
  const scale = crop.scale ?? 1;
  const cropTransform = getQuickEditCropTransform(crop);

  return (
    <div className="grid gap-3 rounded-lg border border-border bg-surface-elevated p-3">
      <div
        ref={frameRef}
        className={[
          "relative mx-auto aspect-[9/16] w-full max-w-[220px] overflow-hidden rounded-lg bg-slate-950 touch-none",
          isDragging ? "cursor-grabbing" : "cursor-grab",
        ].join(" ")}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          dragStartRef.current = {
            pointerX: event.clientX,
            pointerY: event.clientY,
            positionX,
            positionY,
          };
          setIsDragging(true);
        }}
        onPointerMove={(event) => {
          const frame = frameRef.current;
          const dragStart = dragStartRef.current;

          if (!frame || !dragStart) {
            return;
          }

          const bounds = frame.getBoundingClientRect();
          const nextPositionX =
            dragStart.positionX +
            ((event.clientX - dragStart.pointerX) / bounds.width) * 2;
          const nextPositionY =
            dragStart.positionY +
            ((event.clientY - dragStart.pointerY) / bounds.height) * 2;

          onChange({
            ...crop,
            positionX: clamp(nextPositionX, -1, 1),
            positionY: clamp(nextPositionY, -1, 1),
          });
        }}
        onPointerUp={(event) => {
          event.currentTarget.releasePointerCapture(event.pointerId);
          dragStartRef.current = null;
          setIsDragging(false);
        }}
      >
        {mediaSrc ? (
          <video
            aria-label={label}
            className="h-full w-full object-cover"
            loop
            muted
            playsInline
            poster={posterSrc ?? undefined}
            src={mediaSrc}
            style={{
              transform: cropTransform,
              transformOrigin: "center",
            }}
            autoPlay
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm font-semibold text-slate-300">
            Load preview first
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 border-2 border-white/80" />
      </div>
      <label className="grid gap-2 text-sm font-semibold text-text-primary">
        Zoom
        <input
          type="range"
          min="1"
          max="3"
          step="0.01"
          value={scale}
          onChange={(event) =>
            onChange({
              ...crop,
              scale: Number(event.currentTarget.value),
            })
          }
        />
      </label>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        icon={<RotateCcw aria-hidden className="h-4 w-4" />}
        onClick={onReset}
      >
        Reset crop
      </Button>
    </div>
  );
}
