"use client";

import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { getTextOverlayCssProperties } from "@/lib/clipstitchr/utils/getTextOverlayCssProperties";

type SwiprStaticTextOverlayBoxProps = {
  textOverlay: TextOverlay;
};

export function SwiprStaticTextOverlayBox({
  textOverlay,
}: SwiprStaticTextOverlayBoxProps) {
  const style = getTextOverlayCssProperties(textOverlay);

  return (
    <div
      className="absolute z-10 select-none text-center leading-[1.08] [overflow-wrap:anywhere]"
      style={style}
    >
      {textOverlay.text}
    </div>
  );
}
