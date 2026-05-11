"use client";

import { Sparkles } from "lucide-react";
import { CliprVoiceDropdown } from "@/app/_components/clipr/CliprVoiceDropdown";
import { Button } from "@/app/_components/ui/Button";
import { CLIPR_DURATION_OPTIONS } from "@/lib/clipstitchr/constants/cliprDurationOptions";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";

type CliprControlsPanelProps = {
  durationSeconds: CliprDurationSeconds;
  hasConsent: boolean;
  isGenerating: boolean;
  isReady: boolean;
  voice: string;
  onConsentChange: (hasConsent: boolean) => void;
  onDurationChange: (durationSeconds: CliprDurationSeconds) => void;
  onGenerate: () => void;
  onMakeVoiceDefault: (voice: string) => void;
  onVoiceChange: (voice: string) => void;
};

export function CliprControlsPanel({
  durationSeconds,
  hasConsent,
  isGenerating,
  isReady,
  voice,
  onConsentChange,
  onDurationChange,
  onGenerate,
  onMakeVoiceDefault,
  onVoiceChange,
}: CliprControlsPanelProps) {
  return (
    <section className="border-t border-border pt-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
        <div>
          <p className="text-sm font-semibold text-accent-dark">Setup</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Create engagement clip
          </h2>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            Clipr creates a no-CTA talking clip from the selected product and
            avatar photo.
          </p>
        </div>
        <Button
          type="button"
          icon={<Sparkles aria-hidden className="h-4 w-4" />}
          isLoading={isGenerating}
          disabled={!isReady}
          onClick={onGenerate}
        >
          Create Clip
        </Button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-text-primary">Length</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {CLIPR_DURATION_OPTIONS.map((option) => (
              <Button
                key={option}
                type="button"
                variant={durationSeconds === option ? "primary" : "secondary"}
                onClick={() => onDurationChange(option)}
              >
                {option}s
              </Button>
            ))}
          </div>
        </div>
        <CliprVoiceDropdown
          value={voice}
          onChange={onVoiceChange}
          onMakeDefault={onMakeVoiceDefault}
        />
      </div>

      <label className="mt-4 flex items-start gap-2 text-xs leading-5 text-text-secondary">
        <input
          type="checkbox"
          checked={hasConsent}
          className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-accent"
          onChange={(event) => onConsentChange(event.currentTarget.checked)}
        />
        <span>I have rights and consent for this avatar photo.</span>
      </label>
    </section>
  );
}
