"use client";

import { useMemo, useState } from "react";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { SwaprControlsPanel } from "@/app/_components/swapr/SwaprControlsPanel";
import { SwaprEmptyState } from "@/app/_components/swapr/SwaprEmptyState";
import { SwaprOutputPanel } from "@/app/_components/swapr/SwaprOutputPanel";
import { SwaprPhotoSelector } from "@/app/_components/swapr/SwaprPhotoSelector";
import { SwaprUgcSelector } from "@/app/_components/swapr/SwaprUgcSelector";
import { SWAPR_REFERENCE_VIDEO_MAX_SIZE_BYTES } from "@/lib/clipstitchr/constants/swaprReferenceVideoMaxSizeBytes";
import { useClipLibrary } from "@/lib/clipstitchr/hooks/useClipLibrary";
import { usePhotoLibrary } from "@/lib/clipstitchr/hooks/usePhotoLibrary";
import { useSwaprGeneration } from "@/lib/clipstitchr/hooks/useSwaprGeneration";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";
import type { SwaprCharacterOrientation } from "@/lib/clipstitchr/types/SwaprCharacterOrientation";
import type { SwaprMode } from "@/lib/clipstitchr/types/SwaprMode";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { filterClipsByType } from "@/lib/clipstitchr/utils/filterClipsByType";

export function SwaprPageClient() {
  const library = useClipLibrary();
  const photoLibrary = usePhotoLibrary();
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | undefined>();
  const [photoAvatarFilterId, setPhotoAvatarFilterId] = useState("all");
  const [selectedClipId, setSelectedClipId] = useState<string | undefined>();
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<SwaprMode>("std");
  const [characterOrientation, setCharacterOrientation] =
    useState<SwaprCharacterOrientation>("image");
  const [keepOriginalSound, setKeepOriginalSound] = useState(true);
  const [hasConsent, setHasConsent] = useState(false);
  const [assetLoadError, setAssetLoadError] = useState<string | null>(null);
  const generator = useSwaprGeneration(library.refresh);
  const ugcClips = useMemo(
    () => filterClipsByType(library.clips, "ugc"),
    [library.clips],
  );
  const hasPhotos = photoLibrary.photos.length > 0;
  const hasUgcClips = ugcClips.length > 0;
  const hasSwaprInputs = hasPhotos && hasUgcClips;
  const visiblePhotos = useMemo(
    () =>
      photoLibrary.photos.filter(
        (photo) =>
          photoAvatarFilterId === "all" ||
          photo.avatarId === photoAvatarFilterId,
      ),
    [photoAvatarFilterId, photoLibrary.photos],
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

  const selectPhoto = (photo: PhotoAssetMetadata) =>
    setSelectedPhotoId((currentPhotoId) =>
      currentPhotoId === photo.id ? undefined : photo.id,
    );
  const selectClip = (clip: VideoClipMetadata) => setSelectedClipId(clip.id);
  const handleGenerate = async () => {
    if (!selectedPhoto || !selectedClip) {
      return;
    }

    setAssetLoadError(null);

    const [photo, clip] = await Promise.all([
      photoLibrary.loadPhoto(selectedPhoto.id),
      library.loadClip(selectedClip.id),
    ]);

    if (!photo || !clip) {
      setAssetLoadError("Unable to load the selected Swapr assets.");
      return;
    }

    await generator.generate({
      photo,
      clip,
      prompt,
      mode,
      characterOrientation,
      keepOriginalSound,
    });
  };

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <DashboardPageHeader
          eyebrow="UGC swapping"
          title="Create UGC clips"
          description="Create a new UGC clip from an avatar photo and an existing UGC clip."
        />

        {library.error || photoLibrary.error || assetLoadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {library.error ?? photoLibrary.error ?? assetLoadError}
          </div>
        ) : null}

        {hasSwaprInputs ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="flex min-w-0 flex-col gap-6">
              <SwaprPhotoSelector
                avatars={photoLibrary.avatars}
                avatarFilterId={photoAvatarFilterId}
                photos={visiblePhotos}
                selectedPhotoId={selectedPhotoId}
                onAvatarFilterChange={setPhotoAvatarFilterId}
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
                onGenerate={() => void handleGenerate()}
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
        ) : (
          <SwaprEmptyState
            hasPhotos={hasPhotos}
            hasUgcClips={hasUgcClips}
          />
        )}
      </div>
    </DashboardShell>
  );
}
