"use client";

import { Trash2 } from "lucide-react";
import { IconButton } from "@/app/_components/ui/IconButton";
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
      <section className="border-t border-border pt-4 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
        <p className="text-sm font-semibold text-text-secondary">
          Select an image to edit text.
        </p>
      </section>
    );
  }

  const textOverlay = activeSlide.textOverlay;
  const handleChange = (nextOverlay: TextOverlay) => {
    onChange(clampTextOverlay(nextOverlay, SWIPR_STATIC_DURATION));
  };

  return (
    <section className="border-t border-border pt-4 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-accent-dark">Text</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
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
    </section>
  );
}
