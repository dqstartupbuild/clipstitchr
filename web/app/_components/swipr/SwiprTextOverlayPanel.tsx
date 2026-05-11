"use client";

import { Trash2, WandSparkles } from "lucide-react";
import { TextOverlayBackgroundColorPicker } from "@/app/_components/stitchr/TextOverlayBackgroundColorPicker";
import { TextOverlayColorPicker } from "@/app/_components/stitchr/TextOverlayColorPicker";
import { TextOverlayStrokeColorPicker } from "@/app/_components/stitchr/TextOverlayStrokeColorPicker";
import { TextOverlayStylePicker } from "@/app/_components/stitchr/TextOverlayStylePicker";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { SWIPR_STATIC_DURATION } from "@/lib/clipstitchr/constants/swiprStaticDuration";
import type { SwiprSlide } from "@/lib/clipstitchr/types/SwiprSlide";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";

type SwiprTextOverlayPanelProps = {
  activeSlide: SwiprSlide | null;
  activeSlideIndex: number;
  generationError?: string | null;
  isGeneratingText?: boolean;
  onChange: (textOverlay: TextOverlay) => void;
  onGenerateAllText?: () => void;
};

export function SwiprTextOverlayPanel({
  activeSlide,
  activeSlideIndex,
  generationError,
  isGeneratingText = false,
  onChange,
  onGenerateAllText,
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
      {onGenerateAllText ? (
        <div className="mb-4 grid gap-3 border-b border-border pb-4">
          <Button
            type="button"
            variant="secondary"
            icon={<WandSparkles aria-hidden className="h-4 w-4" />}
            isLoading={isGeneratingText}
            disabled={isGeneratingText}
            onClick={onGenerateAllText}
          >
            Generate All Text
          </Button>
          {generationError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {generationError}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-col gap-3">
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
        <div className="grid gap-3 lg:grid-cols-3">
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
      </div>
    </section>
  );
}
