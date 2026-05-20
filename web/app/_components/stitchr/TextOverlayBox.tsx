"use client";

import { useRef, useState, type RefObject } from "react";
import { useTextOverlayDrag } from "@/lib/clipstitchr/hooks/useTextOverlayDrag";
import { useTextOverlayResize } from "@/lib/clipstitchr/hooks/useTextOverlayResize";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { getTextOverlayCssProperties } from "@/lib/clipstitchr/utils/getTextOverlayCssProperties";

type TextOverlayBoxProps = {
  textOverlay: TextOverlay;
  stageRef: RefObject<HTMLDivElement | null>;
  totalDuration: number;
  onChange: (textOverlay: TextOverlay) => void;
};

export function TextOverlayBox({
  textOverlay,
  stageRef,
  totalDuration,
  onChange,
}: TextOverlayBoxProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
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
        onPointerDown={handleDrag}
      >
        {textOverlay.text}
        <div
          aria-hidden
          className="absolute -bottom-2 -right-2 h-4 w-4 cursor-nwse-resize rounded-sm border border-white bg-accent opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          onPointerDown={handleResize}
        />
      </div>
    </>
  );
}
