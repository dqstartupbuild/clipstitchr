"use client";

import type { CSSProperties } from "react";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { getTextOverlayBackgroundColor } from "@/lib/clipstitchr/utils/getTextOverlayBackgroundColor";
import { getTextOverlayColor } from "@/lib/clipstitchr/utils/getTextOverlayColor";
import { getTextOverlayStrokeColor } from "@/lib/clipstitchr/utils/getTextOverlayStrokeColor";
import { getTextOverlayStyle } from "@/lib/clipstitchr/utils/getTextOverlayStyle";

type SwiprStaticTextOverlayBoxProps = {
  textOverlay: TextOverlay;
};

export function SwiprStaticTextOverlayBox({
  textOverlay,
}: SwiprStaticTextOverlayBoxProps) {
  const overlayStyle = getTextOverlayStyle(textOverlay.styleId);
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
      className="absolute z-10 select-none text-center leading-[1.08] [overflow-wrap:anywhere]"
      style={style}
    >
      {textOverlay.text}
    </div>
  );
}
