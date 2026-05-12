import { Mic2 } from "lucide-react";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import { cliprVoices } from "@/lib/clipstitchr/constants/cliprVoices";

type CliprVoiceSelectProps = {
  makeDefault: boolean;
  value: string;
  onMakeDefaultChange: (makeDefault: boolean) => void;
  onVoiceChange: (voiceId: string) => void;
};

export function CliprVoiceSelect({
  makeDefault,
  value,
  onMakeDefaultChange,
  onVoiceChange,
}: CliprVoiceSelectProps) {
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
        <label className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary">
          <input
            type="checkbox"
            checked={makeDefault}
            onChange={(event) => onMakeDefaultChange(event.target.checked)}
          />
          Make default
        </label>
      </div>
    </section>
  );
}
