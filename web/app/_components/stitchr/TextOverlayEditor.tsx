"use client";

import { Copy, Plus, Trash2, Type } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { TextOverlayTimeline } from "@/app/_components/stitchr/TextOverlayTimeline";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { createDefaultTextOverlay } from "@/lib/clipstitchr/utils/createDefaultTextOverlay";
import { getActiveTextOverlayId } from "@/lib/clipstitchr/utils/getActiveTextOverlayId";
import { getTextOverlayId } from "@/lib/clipstitchr/utils/getTextOverlayId";
import { getTextOverlayIndexById } from "@/lib/clipstitchr/utils/getTextOverlayIndexById";

type TextOverlayEditorProps = {
  textOverlays: TextOverlay[];
  totalDuration: number;
  ugcDuration: number;
  currentTime: number;
  activeTextOverlayId: string | null;
  canCopyToAll?: boolean;
  onActiveTextOverlayIdChange: (textOverlayId: string | null) => void;
  onChange: (textOverlays: TextOverlay[]) => void;
  onCopyToAll?: () => void;
};

export function TextOverlayEditor({
  textOverlays,
  totalDuration,
  ugcDuration,
  currentTime,
  activeTextOverlayId,
  canCopyToAll = false,
  onActiveTextOverlayIdChange,
  onChange,
  onCopyToAll,
}: TextOverlayEditorProps) {
  const selectedTextOverlayId = getActiveTextOverlayId(
    textOverlays,
    activeTextOverlayId,
  );
  const activeTextOverlayIndex = getTextOverlayIndexById(
    textOverlays,
    selectedTextOverlayId,
  );
  const activeTextOverlay =
    activeTextOverlayIndex >= 0 ? textOverlays[activeTextOverlayIndex] : null;
  const handleAdd = () => {
    const nextTextOverlay = createDefaultTextOverlay(totalDuration, currentTime);
    const nextTextOverlays = [...textOverlays, nextTextOverlay];

    onChange(nextTextOverlays);
    onActiveTextOverlayIdChange(
      getTextOverlayId(nextTextOverlay, nextTextOverlays.length - 1),
    );
  };
  const handleRemove = () => {
    if (activeTextOverlayIndex < 0) {
      return;
    }

    const nextTextOverlays = textOverlays.filter(
      (_, index) => index !== activeTextOverlayIndex,
    );
    const nextActiveIndex = Math.min(
      activeTextOverlayIndex,
      nextTextOverlays.length - 1,
    );

    onChange(nextTextOverlays);
    onActiveTextOverlayIdChange(
      nextActiveIndex >= 0
        ? getTextOverlayId(nextTextOverlays[nextActiveIndex], nextActiveIndex)
        : null,
    );
  };
  const handleActiveTextOverlayChange = (nextTextOverlay: TextOverlay) => {
    if (activeTextOverlayIndex < 0) {
      return;
    }

    onChange(
      textOverlays.map((textOverlay, index) =>
        index === activeTextOverlayIndex ? nextTextOverlay : textOverlay,
      ),
    );
  };

  if (!textOverlays.length) {
    return (
      <div className="mt-4 min-w-0 border-t border-border pt-4">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={<Type aria-hidden className="h-4 w-4" />}
          onClick={handleAdd}
        >
          Add text
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 min-w-0 border-t border-border pt-4">
      <div className="mb-3 flex min-w-0 flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          {textOverlays.map((textOverlay, index) => {
            const textOverlayId = getTextOverlayId(textOverlay, index);
            const label = textOverlay.text.trim() || `Text ${index + 1}`;

            return (
              <button
                key={textOverlayId}
                type="button"
                aria-pressed={textOverlayId === selectedTextOverlayId}
                className={[
                  "max-w-full truncate rounded-full border px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                  textOverlayId === selectedTextOverlayId
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-white text-text-secondary hover:border-accent hover:text-accent",
                ].join(" ")}
                onClick={() => onActiveTextOverlayIdChange(textOverlayId)}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<Plus aria-hidden className="h-4 w-4" />}
            onClick={handleAdd}
          >
            Add text
          </Button>
          {onCopyToAll ? (
            <IconButton
              type="button"
              label="Copy text overlays to all"
              icon={<Copy aria-hidden className="h-4 w-4" />}
              disabled={!canCopyToAll}
              onClick={onCopyToAll}
            />
          ) : null}
          <IconButton
            type="button"
            label="Remove text"
            variant="danger"
            icon={<Trash2 aria-hidden className="h-4 w-4" />}
            onClick={handleRemove}
          />
        </div>
      </div>
      {activeTextOverlay ? (
        <TextOverlayTimeline
          textOverlay={activeTextOverlay}
          totalDuration={totalDuration}
          ugcDuration={ugcDuration}
          currentTime={currentTime}
          onChange={handleActiveTextOverlayChange}
        />
      ) : null}
    </div>
  );
}
