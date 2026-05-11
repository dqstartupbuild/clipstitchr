"use client";

import { Trash2, Type, WandSparkles } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import { TextOverlayBackgroundColorPicker } from "@/app/_components/stitchr/TextOverlayBackgroundColorPicker";
import { TextOverlayColorPicker } from "@/app/_components/stitchr/TextOverlayColorPicker";
import { TextOverlayStrokeColorPicker } from "@/app/_components/stitchr/TextOverlayStrokeColorPicker";
import { TextOverlayStylePicker } from "@/app/_components/stitchr/TextOverlayStylePicker";
import { TextOverlayTimeline } from "@/app/_components/stitchr/TextOverlayTimeline";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";
import { createDefaultTextOverlay } from "@/lib/clipstitchr/utils/createDefaultTextOverlay";

type TextOverlayEditorProps = {
  textOverlay: TextOverlay | null;
  totalDuration: number;
  ugcDuration: number;
  currentTime: number;
  generationError?: string | null;
  isGeneratingText?: boolean;
  productOptions?: { label: string; value: string }[];
  selectedProductId?: string;
  onChange: (textOverlay: TextOverlay | null) => void;
  onGenerateText?: () => Promise<string | null>;
  onProductChange?: (productId: string) => void;
};

export function TextOverlayEditor({
  textOverlay,
  totalDuration,
  ugcDuration,
  currentTime,
  generationError,
  isGeneratingText = false,
  productOptions = [],
  selectedProductId = "",
  onChange,
  onGenerateText,
  onProductChange,
}: TextOverlayEditorProps) {
  const handleAdd = () => {
    onChange(createDefaultTextOverlay(totalDuration, currentTime));
  };
  const handleGenerateText = async () => {
    if (!onGenerateText) {
      return;
    }

    const generatedText = await onGenerateText();

    if (!generatedText) {
      return;
    }

    onChange({
      ...(textOverlay ?? createDefaultTextOverlay(totalDuration, currentTime)),
      text: generatedText,
    });
  };
  const generatorControls = onGenerateText ? (
    <div className="mb-4 grid gap-3 border-b border-border pb-4">
      <div className="grid gap-3">
        <SelectInput
          label="Product"
          value={selectedProductId}
          options={productOptions}
          disabled={!productOptions.length || isGeneratingText}
          onChange={(event) => onProductChange?.(event.target.value)}
        />
        <Button
          type="button"
          variant="secondary"
          icon={<WandSparkles aria-hidden className="h-4 w-4" />}
          disabled={!selectedProductId || isGeneratingText}
          isLoading={isGeneratingText}
          onClick={() => void handleGenerateText()}
        >
          Generate Text
        </Button>
      </div>
      {generationError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {generationError}
        </div>
      ) : null}
    </div>
  ) : null;

  if (!textOverlay) {
    return (
      <div className="mt-4 border-t border-border pt-4">
        {generatorControls}
        <Button
          type="button"
          variant="secondary"
          icon={<Type aria-hidden className="h-4 w-4" />}
          onClick={handleAdd}
        >
          Add text
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-border pt-4">
      {generatorControls}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-accent-dark">Text</p>
          <h3 className="mt-1 text-base font-bold text-text-primary">
            Overlay
          </h3>
        </div>
        <IconButton
          type="button"
          label="Remove text"
          variant="danger"
          icon={<Trash2 aria-hidden className="h-4 w-4" />}
          onClick={() => onChange(null)}
        />
      </div>
      <div className="flex flex-col gap-3">
        <input
          value={textOverlay.text}
          maxLength={96}
          className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-medium text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
          onChange={(event) =>
            onChange({ ...textOverlay, text: event.target.value })
          }
        />
        <TextOverlayStylePicker
          textOverlay={textOverlay}
          onChange={(nextOverlay) =>
            onChange(clampTextOverlay(nextOverlay, totalDuration))
          }
        />
        <div className="grid gap-3 lg:grid-cols-3">
          <TextOverlayColorPicker
            textOverlay={textOverlay}
            onChange={(nextOverlay) =>
              onChange(clampTextOverlay(nextOverlay, totalDuration))
            }
          />
          <TextOverlayBackgroundColorPicker
            textOverlay={textOverlay}
            onChange={(nextOverlay) =>
              onChange(clampTextOverlay(nextOverlay, totalDuration))
            }
          />
          <TextOverlayStrokeColorPicker
            textOverlay={textOverlay}
            onChange={(nextOverlay) =>
              onChange(clampTextOverlay(nextOverlay, totalDuration))
            }
          />
        </div>
        <TextOverlayTimeline
          textOverlay={textOverlay}
          totalDuration={totalDuration}
          ugcDuration={ugcDuration}
          currentTime={currentTime}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
