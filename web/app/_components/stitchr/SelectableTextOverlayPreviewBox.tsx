"use client";

import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { getTextOverlayCssProperties } from "@/lib/clipstitchr/utils/getTextOverlayCssProperties";

type SelectableTextOverlayPreviewBoxProps = {
  textOverlay: TextOverlay;
  onSelect: () => void;
};

export function SelectableTextOverlayPreviewBox({
  textOverlay,
  onSelect,
}: SelectableTextOverlayPreviewBoxProps) {
  const style = getTextOverlayCssProperties(textOverlay);

  return (
    <button
      type="button"
      aria-label="Select text overlay"
      data-swipe-ignore="true"
      className="absolute z-10 select-none border border-transparent bg-transparent p-0 text-center leading-[1.08] [overflow-wrap:anywhere] hover:border-white/70 focus-visible:border-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent/80"
      style={style}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onSelect();
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
    >
      {textOverlay.text}
    </button>
  );
}
