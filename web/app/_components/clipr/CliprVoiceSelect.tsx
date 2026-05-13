import { Mic2 } from "lucide-react";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import { Button } from "@/app/_components/ui/Button";
import { CliprVoicePreviewButton } from "@/app/_components/clipr/CliprVoicePreviewButton";
import { cliprVoices } from "@/lib/clipstitchr/constants/cliprVoices";

type CliprVoiceSelectProps = {
  canSaveDefault: boolean;
  isSavingDefault: boolean;
  value: string;
  onSaveDefault: () => void;
  onVoiceChange: (voiceId: string) => void;
};

export function CliprVoiceSelect({
  canSaveDefault,
  isSavingDefault,
  value,
  onSaveDefault,
  onVoiceChange,
}: CliprVoiceSelectProps) {
  const selectedVoice =
    cliprVoices.find((voice) => voice.id === value) ?? cliprVoices[0];

  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-accent">
          <Mic2 aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-accent-dark">Voice</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Narration
          </h2>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <SelectInput
          label="Voice"
          value={value}
          options={cliprVoices.map((voice) => ({
            label: `${voice.name} - ${voice.description}`,
            value: voice.id,
          }))}
          onChange={(event) => onVoiceChange(event.target.value)}
        />
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <CliprVoicePreviewButton
            key={selectedVoice.id}
            src={selectedVoice.previewSrc}
            voiceName={selectedVoice.name}
          />
          {canSaveDefault ? (
            <Button
              type="button"
              variant="secondary"
              isLoading={isSavingDefault}
              onClick={onSaveDefault}
            >
              Make default
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
