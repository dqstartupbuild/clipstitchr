import { ImagePlus, Images, Upload } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { SearchInput } from "@/app/_components/ui/SearchInput";
import { SwiprBackgroundLibraryCard } from "@/app/_components/swipr/SwiprBackgroundLibraryCard";
import { ACCEPTED_PHOTO_TYPES } from "@/lib/clipstitchr/constants/acceptedPhotoTypes";
import type { SwiprBackground } from "@/lib/clipstitchr/types/SwiprBackground";
import type { SwiprBackgroundAsset } from "@/lib/clipstitchr/types/SwiprBackgroundAsset";

type SwiprBackgroundPanelProps = {
  background: SwiprBackground | null;
  backgrounds: SwiprBackgroundAsset[];
  backgroundSearchQuery: string;
  isSaving: boolean;
  isGeneratingAi: boolean;
  isAiDisabled: boolean;
  onBackgroundSearchChange: (query: string) => void;
  onSelectBackground: (background: SwiprBackgroundAsset) => void;
  onGenerateAiBackground: () => void;
  onUploadBackground: (file: File) => void;
};

export function SwiprBackgroundPanel({
  background,
  backgrounds,
  backgroundSearchQuery,
  isSaving,
  isGeneratingAi,
  isAiDisabled,
  onBackgroundSearchChange,
  onSelectBackground,
  onGenerateAiBackground,
  onUploadBackground,
}: SwiprBackgroundPanelProps) {
  const isBusy = isSaving || isGeneratingAi;

  return (
    <section className="border-t border-border pt-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-accent">
          <ImagePlus aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-accent-dark">Background</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Single image
          </h2>
        </div>
      </div>
      <div className="grid gap-3">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <SearchInput
            label="Search backgrounds"
            value={backgroundSearchQuery}
            onChange={onBackgroundSearchChange}
            placeholder="Search backgrounds"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              icon={<Images aria-hidden className="h-4 w-4" />}
              isLoading={isGeneratingAi}
              disabled={isSaving || isAiDisabled}
              onClick={onGenerateAiBackground}
            >
              Generate
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
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    onUploadBackground(file);
                  }

                  event.target.value = "";
                }}
              />
            </label>
          </div>
        </div>
        <div>
          {backgrounds.length ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {backgrounds.map((backgroundAsset) => (
                <SwiprBackgroundLibraryCard
                  key={backgroundAsset.id}
                  background={backgroundAsset}
                  isSelected={backgroundAsset.id === background?.id}
                  onSelect={onSelectBackground}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-surface-elevated px-3 py-3 text-sm font-semibold text-text-secondary">
              No backgrounds yet
            </div>
            )}
        </div>
        <div className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm font-semibold text-text-secondary">
          {background ? background.name : "No background selected"}
        </div>
      </div>
    </section>
  );
}
