"use client";

import type { CSSProperties, RefObject } from "react";
import { useTextOverlayDrag } from "@/lib/clipr/hooks/useTextOverlayDrag";
import { useTextOverlayResize } from "@/lib/clipr/hooks/useTextOverlayResize";
import type { TextOverlay } from "@/lib/clipr/types/TextOverlay";
import { getTextOverlayBackgroundColor } from "@/lib/clipr/utils/getTextOverlayBackgroundColor";
import { getTextOverlayColor } from "@/lib/clipr/utils/getTextOverlayColor";
import { getTextOverlayStrokeColor } from "@/lib/clipr/utils/getTextOverlayStrokeColor";
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
    left: overlayStyle.fullWidthBand ? 0 : `${textOverlay.x * 100}%`,
    top: `${textOverlay.y * 100}%`,
    width: overlayStyle.fullWidthBand ? "100%" : `${textOverlay.width * 100}%`,
    fontSize: `${textOverlay.fontSize * (overlayStyle.fontScale ?? 1) * 100}cqh`,
    fontFamily: overlayStyle.fontFamily,
    fontWeight: overlayStyle.fontWeight,
    color: getTextOverlayColor(textOverlay),
    backgroundColor: getTextOverlayBackgroundColor(textOverlay),
    borderRadius: overlayStyle.borderRadiusRatio && !overlayStyle.fullWidthBand
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
        ? `${overlayStyle.strokeWidthRatio}em ${getTextOverlayStrokeColor(
            textOverlay,
          )}`
        : undefined,
  };

  return (
    <div
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
  );
}
