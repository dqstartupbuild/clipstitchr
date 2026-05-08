"use client";

import { Trash2, Type } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
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
  onChange: (textOverlay: TextOverlay | null) => void;
};

export function TextOverlayEditor({
  textOverlay,
  totalDuration,
  ugcDuration,
  currentTime,
  onChange,
}: TextOverlayEditorProps) {
  const handleAdd = () => {
    onChange(createDefaultTextOverlay(totalDuration, currentTime));
  };

  if (!textOverlay) {
    return (
      <div className="mt-5 border-t border-border pt-5">
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
    <div className="mt-5 border-t border-border pt-5">
      <div className="mb-4 flex items-center justify-between gap-3">
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
      <div className="flex flex-col gap-4">
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
