"use client";

import { Pencil } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { useTextOverlayDrag } from "@/lib/clipstitchr/hooks/useTextOverlayDrag";
import { useTextOverlayResize } from "@/lib/clipstitchr/hooks/useTextOverlayResize";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { getTextOverlayCssProperties } from "@/lib/clipstitchr/utils/getTextOverlayCssProperties";

type TextOverlayBoxProps = {
  textOverlay: TextOverlay;
  stageRef: RefObject<HTMLDivElement | null>;
  totalDuration: number;
  onChange: (textOverlay: TextOverlay) => void;
  onOpenStyleControls?: () => void;
};

export function TextOverlayBox({
  textOverlay,
  stageRef,
  totalDuration,
  onChange,
  onOpenStyleControls,
}: TextOverlayBoxProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const textInputRef = useRef<HTMLTextAreaElement | null>(null);
  const pointerStartRef = useRef<{
    id: number;
    time: number;
    x: number;
    y: number;
  } | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const [isTextEditing, setIsTextEditing] = useState(false);
  const [snapGuides, setSnapGuides] = useState({
    vertical: false,
    horizontal: false,
  });
  const handleDrag = useTextOverlayDrag({
    textOverlay,
    stageRef,
    overlayRef,
    totalDuration,
    onChange,
    onSnapGuidesChange: setSnapGuides,
  });
  const handleResize = useTextOverlayResize({
    textOverlay,
    stageRef,
    totalDuration,
    onChange,
  });
  const style = getTextOverlayCssProperties(textOverlay);

  useEffect(() => {
    if (!isTextEditing) {
      return;
    }

    const input = textInputRef.current;

    input?.focus();
    input?.setSelectionRange(input.value.length, input.value.length);
  }, [isTextEditing]);

  const openTextEditor = () => {
    setIsTextEditing(true);
  };
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = {
      id: event.pointerId,
      time: event.timeStamp,
      x: event.clientX,
      y: event.clientY,
    };

    if (!isTextEditing) {
      handleDrag(event);
    }
  };
  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isTextEditing) {
      return;
    }

    const pointerStart = pointerStartRef.current;

    if (!pointerStart || pointerStart.id !== event.pointerId) {
      return;
    }

    const travel = Math.hypot(
      event.clientX - pointerStart.x,
      event.clientY - pointerStart.y,
    );

    if (travel > 10 || event.timeStamp - pointerStart.time > 450) {
      lastTapRef.current = null;
      return;
    }

    const lastTap = lastTapRef.current;

    if (
      lastTap &&
      event.timeStamp - lastTap.time < 360 &&
      Math.hypot(event.clientX - lastTap.x, event.clientY - lastTap.y) < 24
    ) {
      event.preventDefault();
      event.stopPropagation();
      lastTapRef.current = null;
      openTextEditor();
      return;
    }

    lastTapRef.current = {
      time: event.timeStamp,
      x: event.clientX,
      y: event.clientY,
    };
  };

  return (
    <>
      {snapGuides.vertical ? (
        <div className="pointer-events-none absolute left-1/2 top-0 z-20 h-full w-px -translate-x-1/2 bg-white/90 shadow-[0_0_0_1px_rgba(15,23,42,0.35)]" />
      ) : null}
      {snapGuides.horizontal ? (
        <div className="pointer-events-none absolute left-0 top-1/2 z-20 h-px w-full -translate-y-1/2 bg-white/90 shadow-[0_0_0_1px_rgba(15,23,42,0.35)]" />
      ) : null}
      <div
        ref={overlayRef}
        data-swipe-ignore="true"
        className="group absolute z-10 cursor-move touch-none select-none border border-transparent text-center leading-[1.08] outline outline-2 outline-transparent transition-colors [overflow-wrap:anywhere] hover:border-white/80 hover:outline-accent/80 focus-visible:border-white/80 focus-visible:outline-accent/80"
        style={style}
        tabIndex={0}
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          openTextEditor();
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {isTextEditing ? (
          <textarea
            ref={textInputRef}
            aria-label="Edit overlay text"
            data-overlay-control="true"
            data-swipe-ignore="true"
            maxLength={96}
            rows={1}
            value={textOverlay.text}
            className="block min-h-[1.1em] w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-center outline-none select-text"
            style={{
              color: "inherit",
              font: "inherit",
              lineHeight: "inherit",
              textShadow: "inherit",
              textTransform: "inherit",
              WebkitTextStroke: "inherit",
            }}
            onBlur={() => setIsTextEditing(false)}
            onChange={(event) =>
              onChange({ ...textOverlay, text: event.currentTarget.value })
            }
            onClick={(event) => event.stopPropagation()}
            onDoubleClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                setIsTextEditing(false);
              }

              if (event.key === "Enter") {
                event.preventDefault();
                setIsTextEditing(false);
              }
            }}
            onPointerDown={(event) => event.stopPropagation()}
          />
        ) : (
          textOverlay.text
        )}
        {onOpenStyleControls ? (
          <button
            type="button"
            aria-label="Open text style controls"
            data-overlay-control="true"
            data-swipe-ignore="true"
            className="absolute -right-3 -top-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white bg-white text-accent opacity-100 shadow-md transition-opacity hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onOpenStyleControls();
            }}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <Pencil aria-hidden className="h-3.5 w-3.5" />
          </button>
        ) : null}
        <div
          aria-hidden
          className="absolute -bottom-2 -right-2 h-4 w-4 cursor-nwse-resize rounded-sm border border-white bg-accent opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          onPointerDown={handleResize}
        />
      </div>
    </>
  );
}
