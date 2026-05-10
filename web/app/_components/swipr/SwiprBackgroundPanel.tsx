import { ImagePlus, Sparkles, Upload } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { ACCEPTED_PHOTO_TYPES } from "@/lib/clipstitchr/constants/acceptedPhotoTypes";
import { SWIPR_BACKGROUND_PRESETS } from "@/lib/clipstitchr/constants/swiprBackgroundPresets";
import type { SwiprBackground } from "@/lib/clipstitchr/types/SwiprBackground";
import type { SwiprBackgroundPresetId } from "@/lib/clipstitchr/types/SwiprBackgroundPresetId";

type SwiprBackgroundPanelProps = {
  background: SwiprBackground | null;
  selectedPresetId: SwiprBackgroundPresetId;
  isGenerating: boolean;
  isGeneratingAi: boolean;
  onPresetChange: (presetId: SwiprBackgroundPresetId) => void;
  onGenerateAiBackground: () => void;
  onGenerateBackground: () => void;
  onUploadBackground: (file: File) => void;
};

export function SwiprBackgroundPanel({
  background,
  selectedPresetId,
  isGenerating,
  isGeneratingAi,
  onPresetChange,
  onGenerateAiBackground,
  onGenerateBackground,
  onUploadBackground,
}: SwiprBackgroundPanelProps) {
  const isBusy = isGenerating || isGeneratingAi;

  return (
    <Panel className="p-4">
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-accent">
          <ImagePlus aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-accent-dark">Background</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Single image
          </h2>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold text-text-primary">
            Starter library
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SWIPR_BACKGROUND_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedPresetId;

              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={isSelected}
                  className={[
                    "flex min-h-9 items-center gap-2 rounded-lg border px-2 text-left text-xs font-semibold transition-colors",
                    isSelected
                      ? "border-accent bg-surface-muted text-accent"
                      : "border-border bg-white text-text-secondary hover:border-accent hover:text-accent",
                  ].join(" ")}
                  disabled={isBusy}
                  onClick={() => onPresetChange(preset.id)}
                >
                  <span
                    aria-hidden
                    className="h-4 w-4 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: preset.accentColor }}
                  />
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            icon={<Sparkles aria-hidden className="h-4 w-4" />}
            isLoading={isGeneratingAi}
            disabled={isGenerating}
            onClick={onGenerateAiBackground}
          >
            AI background
          </Button>
          <Button
            type="button"
            variant="secondary"
            icon={<ImagePlus aria-hidden className="h-4 w-4" />}
            isLoading={isGenerating}
            disabled={isGeneratingAi}
            onClick={onGenerateBackground}
          >
            Starter
          </Button>
          <label
            className={[
              "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text-primary transition-colors hover:border-accent",
              isBusy ? "cursor-not-allowed opacity-60" : "cursor-pointer",
            ].join(" ")}
          >
            <Upload aria-hidden className="h-4 w-4" />
            Upload image
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
        <div className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm font-semibold text-text-secondary">
          {background ? background.name : "No background selected"}
        </div>
      </div>
    </Panel>
  );
}
