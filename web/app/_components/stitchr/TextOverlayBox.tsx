"use client";

import { MoveDiagonal2, Pencil } from "lucide-react";
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
  emptyLabel?: string;
  textOverlay: TextOverlay;
  stageRef: RefObject<HTMLDivElement | null>;
  totalDuration: number;
  onChange: (textOverlay: TextOverlay) => void;
  onOpenStyleControls?: () => void;
};

export function TextOverlayBox({
  emptyLabel,
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
    pointerType: string;
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
  const hasText = textOverlay.text.trim().length > 0;
  const displayText = hasText ? textOverlay.text : (emptyLabel ?? textOverlay.text);

  const resizeTextInput = () => {
    const input = textInputRef.current;

    if (!input) {
      return;
    }

    input.style.height = "auto";
    input.style.height = `${input.scrollHeight}px`;
  };

  useEffect(() => {
    if (!isTextEditing) {
      return;
    }

    const input = textInputRef.current;

    input?.focus();
    input?.setSelectionRange(input.value.length, input.value.length);
    resizeTextInput();
  }, [isTextEditing]);

  useEffect(() => {
    if (isTextEditing) {
      resizeTextInput();
    }
  }, [isTextEditing, textOverlay.text]);

  const openTextEditor = () => {
    setIsTextEditing(true);
  };
  const clearPointerGesture = () => {
    pointerStartRef.current = null;
  };
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const lastTap = lastTapRef.current;

    pointerStartRef.current = {
      id: event.pointerId,
      pointerType: event.pointerType,
      time: event.timeStamp,
      x: event.clientX,
      y: event.clientY,
    };

    if (
      !isTextEditing &&
      (event.detail > 1 ||
        (lastTap &&
          event.timeStamp - lastTap.time < 360 &&
          Math.hypot(event.clientX - lastTap.x, event.clientY - lastTap.y) < 24))
    ) {
      event.preventDefault();
      event.stopPropagation();
      pointerStartRef.current = null;
      lastTapRef.current = null;
      openTextEditor();
      return;
    }

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

    pointerStartRef.current = null;

    const travel = Math.hypot(
      event.clientX - pointerStart.x,
      event.clientY - pointerStart.y,
    );

    if (travel > 10 || event.timeStamp - pointerStart.time > 450) {
      lastTapRef.current = null;
      return;
    }

    if (
      pointerStart.pointerType === "touch" ||
      pointerStart.pointerType === "pen"
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
        onPointerCancel={clearPointerGesture}
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
            wrap="soft"
            className="block min-h-[1.1em] w-full resize-none overflow-hidden whitespace-pre-wrap border-0 bg-transparent p-0 text-center outline-none select-text"
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
            onInput={resizeTextInput}
            onClick={(event) => event.stopPropagation()}
            onDoubleClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              event.stopPropagation();

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
            onPointerUp={(event) => event.stopPropagation()}
          />
        ) : (
          <span className={hasText ? undefined : "opacity-70"}>
            {displayText}
          </span>
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
            onPointerUp={(event) => event.stopPropagation()}
          >
            <Pencil aria-hidden className="h-3.5 w-3.5" />
          </button>
        ) : null}
        <button
          type="button"
          aria-label="Resize text"
          title="Resize text"
          data-overlay-control="true"
          data-swipe-ignore="true"
          className="absolute bottom-1 right-1 inline-flex h-7 w-7 touch-none cursor-nwse-resize items-center justify-center rounded-full border border-white bg-accent text-white opacity-100 shadow-md transition-colors hover:bg-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:-bottom-2 md:-right-2 md:h-4 md:w-4 md:rounded-sm md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onPointerDown={handleResize}
          onPointerUp={(event) => event.stopPropagation()}
        >
          <MoveDiagonal2 aria-hidden className="h-3.5 w-3.5 md:h-2.5 md:w-2.5" />
        </button>
      </div>
    </>
  );
}
