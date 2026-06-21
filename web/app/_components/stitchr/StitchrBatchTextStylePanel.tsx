"use client";

import { AutomationStitchrColorChoicePicker } from "@/app/_components/settings/AutomationStitchrColorChoicePicker";
import { AutomationStitchrTextStylePicker } from "@/app/_components/settings/AutomationStitchrTextStylePicker";
import { TEXT_OVERLAY_STYLES } from "@/lib/clipstitchr/constants/textOverlayStyles";
import type { AutomationStitchrColorChoice } from "@/lib/clipstitchr/types/AutomationStitchrColorChoice";
import type { AutomationStitchrTextStyleChoice } from "@/lib/clipstitchr/types/AutomationStitchrTextStyleChoice";
import { getCssColorHex } from "@/lib/clipstitchr/utils/getCssColorHex";

type StitchrBatchTextStylePanelProps = {
  backgroundColorChoice: AutomationStitchrColorChoice;
  disabled: boolean;
  strokeColorChoice: AutomationStitchrColorChoice;
  textColorChoice: AutomationStitchrColorChoice;
  textStyleChoice: AutomationStitchrTextStyleChoice;
  onBackgroundColorChoiceChange: (value: AutomationStitchrColorChoice) => void;
  onStrokeColorChoiceChange: (value: AutomationStitchrColorChoice) => void;
  onTextColorChoiceChange: (value: AutomationStitchrColorChoice) => void;
  onTextStyleChoiceChange: (value: AutomationStitchrTextStyleChoice) => void;
};

export function StitchrBatchTextStylePanel({
  backgroundColorChoice,
  disabled,
  strokeColorChoice,
  textColorChoice,
  textStyleChoice,
  onBackgroundColorChoiceChange,
  onStrokeColorChoiceChange,
  onTextColorChoiceChange,
  onTextStyleChoiceChange,
}: StitchrBatchTextStylePanelProps) {
  const selectedTextStyle =
    textStyleChoice === "any"
      ? undefined
      : TEXT_OVERLAY_STYLES.find((style) => style.id === textStyleChoice);
  const showsBackgroundColor =
    textStyleChoice === "any" || Boolean(selectedTextStyle?.backgroundColor);
  const showsStrokeColor =
    textStyleChoice === "any" || Boolean(selectedTextStyle?.strokeColor);
  const textColorFallback = getCssColorHex(
    selectedTextStyle?.color ?? "#ffffff",
    "#ffffff",
  );
  const backgroundColorFallback = getCssColorHex(
    selectedTextStyle?.backgroundColor ?? "rgba(2, 6, 23, 0.72)",
    "#020617",
  );
  const strokeColorFallback = getCssColorHex(
    selectedTextStyle?.strokeColor ?? "#020617",
    "#020617",
  );

  return (
    <div className="border-t border-border pt-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-text-primary">
          Batch text style
        </p>
        <AutomationStitchrTextStylePicker
          disabled={disabled}
          previewBackgroundColor={
            backgroundColorChoice === "any" ? undefined : backgroundColorChoice
          }
          previewStrokeColor={
            strokeColorChoice === "any" ? undefined : strokeColorChoice
          }
          previewTextColor={
            textColorChoice === "any" ? undefined : textColorChoice
          }
          value={textStyleChoice}
          onChange={onTextStyleChoiceChange}
        />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <AutomationStitchrColorChoicePicker
          disabled={disabled}
          fallbackColor={textColorFallback}
          label="Text color"
          value={textColorChoice}
          onChange={onTextColorChoiceChange}
        />
        {showsBackgroundColor ? (
          <AutomationStitchrColorChoicePicker
            disabled={disabled}
            fallbackColor={backgroundColorFallback}
            label="Background color"
            value={backgroundColorChoice}
            onChange={onBackgroundColorChoiceChange}
          />
        ) : null}
        {showsStrokeColor ? (
          <AutomationStitchrColorChoicePicker
            disabled={disabled}
            fallbackColor={strokeColorFallback}
            label="Outline color"
            value={strokeColorChoice}
            onChange={onStrokeColorChoiceChange}
          />
        ) : null}
      </div>
    </div>
  );
}
