import { Mic2 } from "lucide-react";
import { CliprVoicePreviewButton } from "@/app/_components/clipr/CliprVoicePreviewButton";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import { cliprVoices } from "@/lib/clipstitchr/constants/cliprVoices";

type CliprVoiceSelectProps = {
  value: string;
  onVoiceChange: (voiceId: string) => void;
};

export function CliprVoiceSelect({
  value,
  onVoiceChange,
}: CliprVoiceSelectProps) {
  const activeValue = cliprVoices.some((voice) => voice.id === value)
    ? value
    : (cliprVoices[0]?.id ?? "");
  const activeVoice = cliprVoices.find((voice) => voice.id === activeValue);

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
      <div className="grid gap-3">
        <div className="flex items-end gap-2">
          <SelectInput
            label="Voice"
            value={activeValue}
            options={cliprVoices.map((voice) => ({
              label: `${voice.name} - ${voice.description}`,
              value: voice.id,
            }))}
            wrapperClassName="min-w-0 flex-1"
            onChange={(event) => onVoiceChange(event.target.value)}
          />
          <CliprVoicePreviewButton
            isCompact
            src={activeVoice?.previewSrc}
            voiceName={activeVoice?.name ?? "selected"}
          />
        </div>
      </div>
    </section>
  );
}
