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
  onPresetChange: (presetId: SwiprBackgroundPresetId) => void;
  onGenerateBackground: () => void;
  onUploadBackground: (file: File) => void;
};

export function SwiprBackgroundPanel({
  background,
  selectedPresetId,
  isGenerating,
  onPresetChange,
  onGenerateBackground,
  onUploadBackground,
}: SwiprBackgroundPanelProps) {
  return (
    <Panel className="p-5">
      <div className="mb-5 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted text-accent">
          <ImagePlus aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-accent-dark">Background</p>
          <h2 className="mt-1 text-lg font-bold text-text-primary">
            Single image
          </h2>
        </div>
      </div>
      <div className="flex flex-col gap-5">
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
                    "flex min-h-11 items-center gap-2 rounded-lg border px-3 text-left text-sm font-semibold transition-colors",
                    isSelected
                      ? "border-accent bg-surface-muted text-accent"
                      : "border-border bg-white text-text-secondary hover:border-accent hover:text-accent",
                  ].join(" ")}
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
            variant="secondary"
            icon={<Sparkles aria-hidden className="h-4 w-4" />}
            isLoading={isGenerating}
            onClick={onGenerateBackground}
          >
            Generate background
          </Button>
          <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text-primary transition-colors hover:border-accent">
            <Upload aria-hidden className="h-4 w-4" />
            Upload image
            <input
              type="file"
              accept={ACCEPTED_PHOTO_TYPES.join(",")}
              className="sr-only"
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
