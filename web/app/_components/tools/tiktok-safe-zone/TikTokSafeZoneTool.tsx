"use client";

import { useMemo, useState } from "react";
import { LocalSafeZoneImagePicker } from "@/app/_components/tools/tiktok-safe-zone/LocalSafeZoneImagePicker";
import { SafeZoneAssessmentCard } from "@/app/_components/tools/tiktok-safe-zone/SafeZoneAssessmentCard";
import { TikTokSafeZoneCanvas } from "@/app/_components/tools/tiktok-safe-zone/TikTokSafeZoneCanvas";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import { defaultPlannedTextBox } from "@/lib/clipstitchr/tools/tiktokSafeZone/defaultPlannedTextBox";
import { getSafeZoneAssessment } from "@/lib/clipstitchr/tools/tiktokSafeZone/getSafeZoneAssessment";
import type { PlannedTextBox } from "@/lib/clipstitchr/tools/tiktokSafeZone/PlannedTextBox";
import { tiktokInFeedConservativePreset } from "@/lib/clipstitchr/tools/tiktokSafeZone/tiktokInFeedConservativePreset";
import { validateSafeZoneImage } from "@/lib/clipstitchr/tools/tiktokSafeZone/validateSafeZoneImage";

export function TikTokSafeZoneTool() {
  const [box, setBox] = useState<PlannedTextBox>(defaultPlannedTextBox);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const objectUrl = useObjectUrl(file);
  const assessment = useMemo(
    () => getSafeZoneAssessment(box, tiktokInFeedConservativePreset),
    [box],
  );
  const selectFile = (nextFile: File | null) => {
    if (!nextFile) {
      setErrorMessage(null);
      setFile(null);
      return;
    }
    const nextErrorMessage = validateSafeZoneImage(nextFile);
    setErrorMessage(nextErrorMessage);
    if (!nextErrorMessage) setFile(nextFile);
  };

  return (
    <section className="px-6 py-16 md:py-20" aria-label="Safe-zone planner">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="grid gap-6">
          <LocalSafeZoneImagePicker
            errorMessage={errorMessage}
            file={file}
            onFile={selectFile}
          />
          <div className="marketing-card p-6">
            <label
              className="grid gap-2 text-sm font-bold text-text-primary"
              htmlFor="planned-safe-zone-text"
            >
              Text you plan to place
              <input
                className="h-11 rounded-lg border border-border bg-white px-3 text-sm font-medium text-text-primary outline-none focus:border-accent"
                id="planned-safe-zone-text"
                maxLength={80}
                onChange={(event) =>
                  setBox((current) => ({
                    ...current,
                    text: event.target.value,
                  }))
                }
                value={box.text}
              />
            </label>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Drag the text box on the preview. Keyboard users can focus it and
              use the arrow keys; hold Shift for a bigger move.
            </p>
          </div>
          <SafeZoneAssessmentCard
            assessment={assessment}
            preset={tiktokInFeedConservativePreset}
          />
        </div>
        <TikTokSafeZoneCanvas
          box={box}
          isClear={assessment.clear}
          objectUrl={objectUrl}
          onBoxChange={setBox}
          preset={tiktokInFeedConservativePreset}
        />
      </div>
    </section>
  );
}
