"use client";

import { SwiprCallToActionStylePicker } from "@/app/_components/swipr/SwiprCallToActionStylePicker";
import { SwiprCreativeContextField } from "@/app/_components/swipr/SwiprCreativeContextField";
import type { SwiprCallToActionStyle } from "@/lib/clipstitchr/types/SwiprCallToActionStyle";

type SwiprWritingControlsProps = {
  callToActionStyle: SwiprCallToActionStyle;
  creativeContext: string;
  disabled: boolean;
  onCallToActionStyleChange: (value: SwiprCallToActionStyle) => void;
  onCreativeContextChange: (value: string) => void;
};

export function SwiprWritingControls({
  callToActionStyle,
  creativeContext,
  disabled,
  onCallToActionStyleChange,
  onCreativeContextChange,
}: SwiprWritingControlsProps) {
  return (
    <div className="grid gap-4 rounded-lg border border-border bg-surface-muted/40 p-4">
      <SwiprCreativeContextField
        disabled={disabled}
        value={creativeContext}
        onChange={onCreativeContextChange}
      />
      <SwiprCallToActionStylePicker
        disabled={disabled}
        value={callToActionStyle}
        onChange={onCallToActionStyleChange}
      />
    </div>
  );
}
