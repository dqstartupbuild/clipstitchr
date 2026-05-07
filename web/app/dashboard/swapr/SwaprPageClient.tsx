"use client";

import { useMemo, useState } from "react";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { SwaprControlsPanel } from "@/app/_components/swapr/SwaprControlsPanel";
import { SwaprOutputPanel } from "@/app/_components/swapr/SwaprOutputPanel";
import { SwaprPhotoSelector } from "@/app/_components/swapr/SwaprPhotoSelector";
import { SwaprUgcSelector } from "@/app/_components/swapr/SwaprUgcSelector";
import { SWAPR_REFERENCE_VIDEO_MAX_SIZE_BYTES } from "@/lib/clipr/constants/swaprReferenceVideoMaxSizeBytes";
import { useClipLibrary } from "@/lib/clipr/hooks/useClipLibrary";
import { usePhotoLibrary } from "@/lib/clipr/hooks/usePhotoLibrary";
import { useSwaprGeneration } from "@/lib/clipr/hooks/useSwaprGeneration";
import type { PhotoAsset } from "@/lib/clipr/types/PhotoAsset";
import type { SwaprCharacterOrientation } from "@/lib/clipr/types/SwaprCharacterOrientation";
import type { SwaprMode } from "@/lib/clipr/types/SwaprMode";
import type { VideoClip } from "@/lib/clipr/types/VideoClip";
import { filterClipsByType } from "@/lib/clipr/utils/filterClipsByType";

export function SwaprPageClient() {
  const library = useClipLibrary();
  const photoLibrary = usePhotoLibrary();
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | undefined>();
  const [selectedClipId, setSelectedClipId] = useState<string | undefined>();
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<SwaprMode>("pro");
  const [characterOrientation, setCharacterOrientation] =
    useState<SwaprCharacterOrientation>("video");
  const [keepOriginalSound, setKeepOriginalSound] = useState(true);
  const [hasConsent, setHasConsent] = useState(false);
  const generator = useSwaprGeneration(library.refresh);
  const ugcClips = useMemo(
    () => filterClipsByType(library.clips, "ugc"),
    [library.clips],
  );
  const selectedPhoto = useMemo(
    () => photoLibrary.photos.find((photo) => photo.id === selectedPhotoId),
    [photoLibrary.photos, selectedPhotoId],
  );
  const selectedClip = useMemo(
    () => ugcClips.find((clip) => clip.id === selectedClipId),
    [ugcClips, selectedClipId],
  );
  const isReady = Boolean(selectedPhoto && selectedClip && hasConsent);

  const selectPhoto = (photo: PhotoAsset) => setSelectedPhotoId(photo.id);
  const selectClip = (clip: VideoClip) => setSelectedClipId(clip.id);

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <DashboardPageHeader
          eyebrow="AI Studio"
          title="Swapr"
          description="Upload a person photo, choose a saved UGC clip, and generate a new UGC video where the photo subject follows the source motion."
        />

        {library.error || photoLibrary.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {library.error ?? photoLibrary.error}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="flex min-w-0 flex-col gap-6">
            <SwaprPhotoSelector
              photos={photoLibrary.photos}
              selectedPhotoId={selectedPhotoId}
              onSelect={selectPhoto}
            />
            <SwaprUgcSelector
              clips={ugcClips}
              selectedClipId={selectedClipId}
              onSelect={selectClip}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <SwaprControlsPanel
              prompt={prompt}
              mode={mode}
              characterOrientation={characterOrientation}
              keepOriginalSound={keepOriginalSound}
              hasConsent={hasConsent}
              selectedClip={selectedClip}
              isGenerating={generator.isGenerating}
              isReady={isReady}
              referenceVideoMaxSizeBytes={SWAPR_REFERENCE_VIDEO_MAX_SIZE_BYTES}
              onPromptChange={setPrompt}
              onModeChange={setMode}
              onCharacterOrientationChange={setCharacterOrientation}
              onKeepOriginalSoundChange={setKeepOriginalSound}
              onConsentChange={setHasConsent}
              onGenerate={() => {
                if (!selectedPhoto || !selectedClip) {
                  return;
                }

                void generator.generate({
                  photo: selectedPhoto,
                  clip: selectedClip,
                  prompt,
                  mode,
                  characterOrientation,
                  keepOriginalSound,
                });
              }}
            />
            <SwaprOutputPanel
              status={generator.status}
              progress={generator.progress}
              error={generator.error}
              predictionId={generator.predictionId}
              generatedClip={generator.generatedClip}
            />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
