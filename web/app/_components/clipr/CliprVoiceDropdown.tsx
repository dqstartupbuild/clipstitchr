"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CLIPR_VOICE_OPTIONS } from "@/lib/clipstitchr/constants/cliprVoiceOptions";

type CliprVoiceDropdownProps = {
  value: string;
  onChange: (voice: string) => void;
  onMakeDefault: (voice: string) => void;
};

export function CliprVoiceDropdown({
  value,
  onChange,
  onMakeDefault,
}: CliprVoiceDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const selectedVoice =
    CLIPR_VOICE_OPTIONS.find((voice) => voice.id === value) ??
    CLIPR_VOICE_OPTIONS[0];

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <span className="text-sm font-semibold text-text-primary">Voice</span>
      <button
        type="button"
        className="mt-2 flex h-10 w-full items-center justify-between gap-3 rounded-lg border border-border bg-white px-3 text-left text-sm font-semibold text-text-primary shadow-sm shadow-slate-200/50 transition-colors hover:border-accent/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <span className="min-w-0 truncate">{selectedVoice.label}</span>
        <ChevronDown aria-hidden className="h-4 w-4 text-text-tertiary" />
      </button>
      {isOpen ? (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-border bg-white shadow-xl shadow-slate-900/10">
          <div className="max-h-64 overflow-y-auto py-1">
            {CLIPR_VOICE_OPTIONS.map((voice) => (
              <button
                key={voice.id}
                type="button"
                className="flex w-full items-start gap-3 px-3 py-2 text-left transition-colors hover:bg-surface-muted"
                onClick={() => {
                  onChange(voice.id);
                  setIsOpen(false);
                }}
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-accent">
                  {voice.id === value ? (
                    <Check aria-hidden className="h-4 w-4" />
                  ) : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-text-primary">
                    {voice.label}
                  </span>
                  <span className="block text-xs leading-5 text-text-secondary">
                    {voice.description}
                  </span>
                </span>
              </button>
            ))}
          </div>
          <div className="border-t border-border p-2">
            <button
              type="button"
              className="w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-accent transition-colors hover:bg-surface-muted"
              onClick={() => {
                onMakeDefault(value);
                setIsOpen(false);
              }}
            >
              Make default
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
