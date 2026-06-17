"use client";

import { ImagePlus, Images, Upload } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { ACCEPTED_PHOTO_TYPES } from "@/lib/clipstitchr/constants/acceptedPhotoTypes";

type SwiprBackgroundPanelProps = {
  generationPrompt: string;
  isSaving: boolean;
  isGeneratingAi: boolean;
  isAiDisabled: boolean;
  activeSlideIndex: number;
  onGenerationPromptChange: (prompt: string) => void;
  onGenerateAiBackground: () => void;
  onUploadBackground: (files: File[]) => void;
};

export function SwiprBackgroundPanel({
  generationPrompt,
  isSaving,
  isGeneratingAi,
  isAiDisabled,
  activeSlideIndex,
  onGenerationPromptChange,
  onGenerateAiBackground,
  onUploadBackground,
}: SwiprBackgroundPanelProps) {
  const isBusy = isSaving || isGeneratingAi;

  return (
    <section className="min-w-0 border-t border-border pt-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-accent">
          <ImagePlus aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-accent-dark">Background</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Slide photos
          </h2>
        </div>
      </div>
      <div className="grid min-w-0 gap-3">
        <label className="grid gap-1 text-sm font-semibold text-text-primary">
          Image prompt
          <textarea
            className="min-h-20 resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
            value={generationPrompt}
            onChange={(event) => onGenerationPromptChange(event.target.value)}
            placeholder="Clean studio product scene with warm daylight"
            disabled={isBusy}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <p className="text-sm font-semibold text-text-secondary">
            Upload photos here, or use Pexels and avatar photos below.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              icon={<Images aria-hidden className="h-4 w-4" />}
              isLoading={isGeneratingAi}
              disabled={isSaving || isAiDisabled}
              onClick={onGenerateAiBackground}
            >
              Generate slide {activeSlideIndex + 1}
            </Button>
            <label
              className={[
                "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-text-primary transition-colors hover:border-accent",
                isBusy ? "cursor-not-allowed opacity-60" : "cursor-pointer",
              ].join(" ")}
            >
              <Upload aria-hidden className="h-4 w-4" />
              Upload
              <input
                type="file"
                accept={ACCEPTED_PHOTO_TYPES.join(",")}
                className="sr-only"
                disabled={isBusy}
                multiple
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);

                  if (files.length) {
                    onUploadBackground(files);
                  }

                  event.target.value = "";
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
