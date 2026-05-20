"use client";

import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { getTextOverlayCssProperties } from "@/lib/clipstitchr/utils/getTextOverlayCssProperties";

type TextOverlayPreviewBoxProps = {
  textOverlay: TextOverlay;
};

export function TextOverlayPreviewBox({
  textOverlay,
}: TextOverlayPreviewBoxProps) {
  const style = getTextOverlayCssProperties(textOverlay);

  return (
    <div
      className="pointer-events-none absolute z-10 select-none text-center leading-[1.08] [overflow-wrap:anywhere]"
      style={style}
    >
      {textOverlay.text}
    </div>
  );
}
