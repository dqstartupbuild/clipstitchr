"use client";

import { Type, X } from "lucide-react";
import { useState } from "react";
import { TextOverlayEditor } from "@/app/_components/stitchr/TextOverlayEditor";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { clampTextOverlays } from "@/lib/clipstitchr/utils/clampTextOverlays";
import { getNonEmptyTextOverlays } from "@/lib/clipstitchr/utils/getNonEmptyTextOverlays";
import { getPlaybackRateDuration } from "@/lib/clipstitchr/utils/getPlaybackRateDuration";
import { getTextOverlayList } from "@/lib/clipstitchr/utils/getTextOverlayList";

type StitchTextSettingsDialogProps = {
  error: string | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (textOverlay: TextOverlay | TextOverlay[] | null) => Promise<void>;
  stitch: Stitch;
};

export function StitchTextSettingsDialog({
  error,
  isSaving,
  onClose,
  onSave,
  stitch,
}: StitchTextSettingsDialogProps) {
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>(
    () => getTextOverlayList(stitch.textOverlays, stitch.textOverlay),
  );
  const [activeTextOverlayId, setActiveTextOverlayId] = useState<string | null>(
    null,
  );
  const ugcDuration = stitch.ugcTrimRange
    ? getPlaybackRateDuration(stitch.ugcTrimRange, stitch.ugcPlaybackRate)
    : 0;
  const handleSave = async () => {
    const nextTextOverlays = getNonEmptyTextOverlays(
      clampTextOverlays(textOverlays, stitch.duration),
    );

    try {
      await onSave(nextTextOverlays.length ? nextTextOverlays : null);
      onClose();
    } catch {
      return;
    }
  };

  return (
    <div
      className="dashboard-dialog-viewport"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stitch-text-dialog-title"
        className="max-h-full w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">Text</p>
            <h2
              id="stitch-text-dialog-title"
              className="mt-1 truncate text-xl font-bold text-text-primary"
            >
              {stitch.name}
            </h2>
          </div>
          <IconButton
            type="button"
            label="Close text settings"
            icon={<X aria-hidden className="h-4 w-4" />}
            onClick={onClose}
          />
        </div>
        <div className="p-5">
          {error ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <TextOverlayEditor
            textOverlays={textOverlays}
            totalDuration={stitch.duration}
            ugcDuration={ugcDuration}
            currentTime={0}
            activeTextOverlayId={activeTextOverlayId}
            onActiveTextOverlayIdChange={setActiveTextOverlayId}
            onChange={setTextOverlays}
          />

          <div className="mt-5 flex justify-end">
            <Button
              type="button"
              icon={<Type aria-hidden className="h-4 w-4" />}
              isLoading={isSaving}
              onClick={() => void handleSave()}
            >
              Save text
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
