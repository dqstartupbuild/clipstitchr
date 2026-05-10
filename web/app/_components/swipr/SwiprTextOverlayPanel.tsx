"use client";

import { Trash2 } from "lucide-react";
import { TextOverlayBackgroundColorPicker } from "@/app/_components/stitchr/TextOverlayBackgroundColorPicker";
import { TextOverlayColorPicker } from "@/app/_components/stitchr/TextOverlayColorPicker";
import { TextOverlayStrokeColorPicker } from "@/app/_components/stitchr/TextOverlayStrokeColorPicker";
import { TextOverlayStylePicker } from "@/app/_components/stitchr/TextOverlayStylePicker";
import { IconButton } from "@/app/_components/ui/IconButton";
import { Panel } from "@/app/_components/ui/Panel";
import { SWIPR_STATIC_DURATION } from "@/lib/clipstitchr/constants/swiprStaticDuration";
import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";

type SwiprTextOverlayPanelProps = {
  activeSlide: SwiprSlide | null;
  activeSlideIndex: number;
  onChange: (textOverlay: TextOverlay) => void;
};

export function SwiprTextOverlayPanel({
  activeSlide,
  activeSlideIndex,
  onChange,
}: SwiprTextOverlayPanelProps) {
  if (!activeSlide) {
    return (
      <Panel className="p-5">
        <p className="text-sm font-semibold text-text-secondary">
          Select an image to edit text.
        </p>
      </Panel>
    );
  }

  const textOverlay = activeSlide.textOverlay;
  const handleChange = (nextOverlay: TextOverlay) => {
    onChange(clampTextOverlay(nextOverlay, SWIPR_STATIC_DURATION));
  };

  return (
    <Panel className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-accent-dark">Text</p>
          <h2 className="mt-1 text-lg font-bold text-text-primary">
            Image {activeSlideIndex + 1}
          </h2>
        </div>
        <IconButton
          type="button"
          label="Clear text"
          variant="danger"
          icon={<Trash2 aria-hidden className="h-4 w-4" />}
          onClick={() => handleChange({ ...textOverlay, text: "" })}
        />
      </div>
      <div className="flex flex-col gap-4">
        <input
          value={textOverlay.text}
          maxLength={96}
          className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-medium text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
          placeholder="Carousel text"
          onChange={(event) =>
            handleChange({ ...textOverlay, text: event.target.value })
          }
        />
        <TextOverlayStylePicker
          textOverlay={textOverlay}
          onChange={handleChange}
        />
        <TextOverlayColorPicker
          textOverlay={textOverlay}
          onChange={handleChange}
        />
        <TextOverlayBackgroundColorPicker
          textOverlay={textOverlay}
          onChange={handleChange}
        />
        <TextOverlayStrokeColorPicker
          textOverlay={textOverlay}
          onChange={handleChange}
        />
      </div>
    </Panel>
  );
}
