"use client";

import type { CSSProperties, RefObject } from "react";
import { useTextOverlayDrag } from "@/lib/clipr/hooks/useTextOverlayDrag";
import { useTextOverlayResize } from "@/lib/clipr/hooks/useTextOverlayResize";
import type { TextOverlay } from "@/lib/clipr/types/TextOverlay";
import { getTextOverlayColor } from "@/lib/clipr/utils/getTextOverlayColor";
import { getTextOverlayStyle } from "@/lib/clipr/utils/getTextOverlayStyle";

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
  const overlayStyle = getTextOverlayStyle(textOverlay.styleId);
  const handleDrag = useTextOverlayDrag({
    textOverlay,
    stageRef,
    totalDuration,
    onChange,
  });
  const handleResize = useTextOverlayResize({
    textOverlay,
    stageRef,
    totalDuration,
    onChange,
  });
  const textShadow =
    overlayStyle.shadowColor && overlayStyle.shadowBlurRatio
      ? `${overlayStyle.shadowOffsetXRatio ?? 0}em ${
          overlayStyle.shadowOffsetYRatio ?? 0
        }em ${overlayStyle.shadowBlurRatio}em ${overlayStyle.shadowColor}`
      : undefined;
  const style: CSSProperties = {
    left: `${textOverlay.x * 100}%`,
    top: `${textOverlay.y * 100}%`,
    width: `${textOverlay.width * 100}%`,
    fontSize: `${textOverlay.fontSize * 100}cqh`,
    fontFamily: overlayStyle.fontFamily,
    fontWeight: overlayStyle.fontWeight,
    color: getTextOverlayColor(textOverlay),
    backgroundColor: overlayStyle.backgroundColor,
    borderRadius: overlayStyle.borderRadiusRatio
      ? `${overlayStyle.borderRadiusRatio}em`
      : undefined,
    padding:
      overlayStyle.paddingXRatio || overlayStyle.paddingYRatio
        ? `${overlayStyle.paddingYRatio ?? 0}em ${
            overlayStyle.paddingXRatio ?? 0
          }em`
        : undefined,
    textShadow,
    textTransform: overlayStyle.textTransform,
    WebkitTextStroke:
      overlayStyle.strokeColor && overlayStyle.strokeWidthRatio
        ? `${overlayStyle.strokeWidthRatio}em ${overlayStyle.strokeColor}`
        : undefined,
  };

  return (
    <div
      className="absolute z-10 cursor-move touch-none select-none border border-white/80 text-center leading-[1.08] outline outline-2 outline-accent/80 transition-opacity [overflow-wrap:anywhere]"
      style={style}
      onPointerDown={handleDrag}
    >
      {textOverlay.text}
      <div
        aria-hidden
        className="absolute -bottom-2 -right-2 h-4 w-4 cursor-nwse-resize rounded-sm border border-white bg-accent shadow-sm"
        onPointerDown={handleResize}
      />
    </div>
  );
}
