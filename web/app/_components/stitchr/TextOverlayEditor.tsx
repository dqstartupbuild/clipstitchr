"use client";

import { Copy, Trash2, Type } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { TextOverlayTimeline } from "@/app/_components/stitchr/TextOverlayTimeline";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { createDefaultTextOverlay } from "@/lib/clipstitchr/utils/createDefaultTextOverlay";

type TextOverlayEditorProps = {
  textOverlay: TextOverlay | null;
  totalDuration: number;
  ugcDuration: number;
  currentTime: number;
  canCopyToAll?: boolean;
  onChange: (textOverlay: TextOverlay | null) => void;
  onCopyToAll?: () => void;
};

export function TextOverlayEditor({
  textOverlay,
  totalDuration,
  ugcDuration,
  currentTime,
  canCopyToAll = false,
  onChange,
  onCopyToAll,
}: TextOverlayEditorProps) {
  const handleAdd = () => {
    onChange(createDefaultTextOverlay(totalDuration, currentTime));
  };

  if (!textOverlay) {
    return (
      <div className="mt-4 border-t border-border pt-4">
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
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-accent-dark">Text</p>
          <h3 className="mt-1 text-base font-bold text-text-primary">
            Overlay
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {onCopyToAll ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<Copy aria-hidden className="h-4 w-4" />}
              disabled={!canCopyToAll}
              onClick={onCopyToAll}
            >
              Copy to all
            </Button>
          ) : null}
          <IconButton
            type="button"
            label="Remove text"
            variant="danger"
            icon={<Trash2 aria-hidden className="h-4 w-4" />}
            onClick={() => onChange(null)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-3">
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
