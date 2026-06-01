"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AvatarFilterSelect } from "@/app/_components/avatars/AvatarFilterSelect";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { SwaprControlsPanel } from "@/app/_components/swapr/SwaprControlsPanel";
import { SwaprEmptyState } from "@/app/_components/swapr/SwaprEmptyState";
import { SwaprOutputPanel } from "@/app/_components/swapr/SwaprOutputPanel";
import { SwaprPhotoSelector } from "@/app/_components/swapr/SwaprPhotoSelector";
import { SwaprSourceClipSelector } from "@/app/_components/swapr/SwaprSourceClipSelector";
import { Panel } from "@/app/_components/ui/Panel";
import { createStitchExportBlob } from "@/lib/clipstitchr/client/createStitchExportBlob";
import { createTemporarySwaprReferenceVideoSegments } from "@/lib/clipstitchr/client/createTemporarySwaprReferenceVideoSegments";
import { deleteObjectsFromR2 } from "@/lib/clipstitchr/client/r2/deleteObjectsFromR2";
import { uploadBlobsToR2 } from "@/lib/clipstitchr/client/r2/uploadBlobsToR2";
import { SWAPR_MAX_REFERENCE_DURATION_SECONDS } from "@/lib/clipstitchr/constants/swaprMaxReferenceDurationSeconds";
import { SWAPR_REFERENCE_VIDEO_MAX_SIZE_BYTES } from "@/lib/clipstitchr/constants/swaprReferenceVideoMaxSizeBytes";
import { useClipLibrary } from "@/lib/clipstitchr/hooks/useClipLibrary";
import { usePhotoLibrary } from "@/lib/clipstitchr/hooks/usePhotoLibrary";
import { useSwaprGeneration } from "@/lib/clipstitchr/hooks/useSwaprGeneration";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";
import type { SwaprCharacterOrientation } from "@/lib/clipstitchr/types/SwaprCharacterOrientation";
import type { SwaprMode } from "@/lib/clipstitchr/types/SwaprMode";
import type { SwaprReferenceVideoSegment } from "@/lib/clipstitchr/types/SwaprReferenceVideoSegment";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { createVideoClipMetadataFromStitch } from "@/lib/clipstitchr/utils/createVideoClipMetadataFromStitch";
import { filterSwaprSourceClips } from "@/lib/clipstitchr/utils/filterSwaprSourceClips";
import { getSearchParamValue } from "@/lib/clipstitchr/utils/getSearchParamValue";
import { getSwaprSegmentDurationLimit } from "@/lib/clipstitchr/utils/getSwaprSegmentDurationLimit";

export function SwaprPageClient() {
  const library = useClipLibrary();
  const photoLibrary = usePhotoLibrary();
  const updateRenderedStitchVideo = useMutation(api.stitches.updateRenderedVideo);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | undefined>(
    () => getSearchParamValue("photoId"),
  );
  const [photoAvatarFilterId, setPhotoAvatarFilterId] = useState("all");
  const [selectedClipId, setSelectedClipId] = useState<string | undefined>(
    () => getSearchParamValue("clipId") ?? getSearchParamValue("stitchId"),
  );
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<SwaprMode>("std");
  const [characterOrientation, setCharacterOrientation] =
    useState<SwaprCharacterOrientation>("image");
  const [keepOriginalSound, setKeepOriginalSound] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [isPreparingSource, setIsPreparingSource] = useState(false);
  const [assetLoadError, setAssetLoadError] = useState<string | null>(null);
  const generator = useSwaprGeneration(library.refresh);
  const sourceUgcClips = useMemo(
    () => filterSwaprSourceClips(library.clips),
    [library.clips],
  );
  const sourceStitchClips = useMemo(
    () => library.stitches.map(createVideoClipMetadataFromStitch),
    [library.stitches],
  );
  const sourceClips = useMemo(
    () => [...sourceUgcClips, ...sourceStitchClips],
    [sourceStitchClips, sourceUgcClips],
  );
  const hasPhotos = photoLibrary.photos.length > 0;
  const hasSourceClips = sourceClips.length > 0;
  const hasSwaprInputs = hasPhotos && hasSourceClips;
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
    () => sourceClips.find((clip) => clip.id === selectedClipId),
    [sourceClips, selectedClipId],
  );
  const isReady = Boolean(selectedPhoto && selectedClip && hasConsent);

  useEffect(() => {
    const syncSelectionFromUrl = () => {
      const initialPhotoId = getSearchParamValue("photoId");
      const initialClipId =
        getSearchParamValue("clipId") ?? getSearchParamValue("stitchId");

      if (!initialPhotoId && !initialClipId) {
        return;
      }

      if (initialPhotoId) {
        setSelectedPhotoId(initialPhotoId);
      }

      if (initialClipId) {
        setSelectedClipId(initialClipId);
      }
    };

    syncSelectionFromUrl();
    window.addEventListener("popstate", syncSelectionFromUrl);

    return () => {
      window.removeEventListener("popstate", syncSelectionFromUrl);
    };
  }, []);

  const selectPhoto = (photo: PhotoAssetMetadata) =>
    setSelectedPhotoId((currentPhotoId) =>
      currentPhotoId === photo.id ? undefined : photo.id,
    );
  const selectClip = (clip: VideoClipMetadata) =>
    setSelectedClipId((currentClipId) =>
      currentClipId === clip.id ? undefined : clip.id,
    );
  const loadSourceClip = async (id: string): Promise<VideoClip | null> => {
    const clip = await library.loadClip(id);

    if (clip) {
      return clip;
    }

    const stitch = library.stitches.find((item) => item.id === id);

    if (!stitch) {
      return null;
    }
    const blob = await createStitchExportBlob(stitch, {
      includePosterMetadata: false,
      loadClip: library.loadClip,
    });
    const metadata = createVideoClipMetadataFromStitch(stitch);

    return {
      ...metadata,
      blob,
      mimeType: blob.type || metadata.mimeType,
      originalSize: blob.size,
      size: blob.size,
      sourceMimeType: blob.type || metadata.sourceMimeType,
    };
  };
  const loadSourcePoster = async (id: string): Promise<Blob | null> => {
    if (sourceUgcClips.some((clip) => clip.id === id)) {
      return await library.loadClipPoster(id);
    }

    if (library.stitches.some((stitch) => stitch.id === id)) {
      return await library.loadStitchPoster(id);
    }

    return await library.loadClipPoster(id);
  };
  const getReferenceVideoSegments = async (
    clip: VideoClipMetadata,
    requestedCharacterOrientation: SwaprCharacterOrientation,
  ): Promise<SwaprReferenceVideoSegment[]> => {
    if (clip.duration > SWAPR_MAX_REFERENCE_DURATION_SECONDS) {
      throw new Error("Choose a source video that is 90 seconds or shorter.");
    }

    const segmentDurationLimit = getSwaprSegmentDurationLimit(
      requestedCharacterOrientation,
    );
    const isRenderedOnExport = clip.videoObject.key.endsWith("/render-on-export");

    if (!isRenderedOnExport && clip.duration <= segmentDurationLimit) {
      return [
        {
          duration: clip.duration,
          videoObject: clip.videoObject,
        },
      ];
    }

    const sourceClip = await loadSourceClip(clip.id);

    if (!sourceClip) {
      throw new Error("Unable to load the selected source video for Swapr.");
    }

    if (sourceClip.blob.size > SWAPR_REFERENCE_VIDEO_MAX_SIZE_BYTES) {
      throw new Error("Choose a smaller source video for Swapr.");
    }

    if (sourceClip.duration > segmentDurationLimit) {
      return createTemporarySwaprReferenceVideoSegments({
        clip,
        segmentDurationLimit,
        sourceClip,
      });
    }

    const [stitchObject] = await uploadBlobsToR2([
      {
        blob: sourceClip.blob,
        kind: "stitch-video",
        recordId: clip.id,
      },
    ]);

    await updateRenderedStitchVideo({
      id: clip.id,
      mimeType: sourceClip.mimeType,
      size: sourceClip.blob.size,
      stitchObject,
    });
    await library.refresh();

    return [
      {
        duration: sourceClip.duration,
        videoObject: stitchObject,
      },
    ];
  };
  const handleGenerate = async () => {
    if (!selectedPhoto || !selectedClip) {
      return;
    }

    setAssetLoadError(null);
    setIsPreparingSource(true);

    let temporaryObjects: SwaprReferenceVideoSegment["videoObject"][] = [];

    try {
      const referenceVideoSegments = await getReferenceVideoSegments(
        selectedClip,
        characterOrientation,
      );
      temporaryObjects = referenceVideoSegments
        .filter((segment) => segment.isTemporary)
        .map((segment) => segment.videoObject);

      const wasQueued = await generator.generate({
        photo: selectedPhoto,
        clip: selectedClip,
        referenceVideoSegments,
        prompt,
        mode,
        characterOrientation,
        keepOriginalSound,
      });

      if (!wasQueued && temporaryObjects.length) {
        await deleteObjectsFromR2(temporaryObjects).catch(() => null);
        temporaryObjects = [];
      }
    } catch (error) {
      setAssetLoadError(
        error instanceof Error
          ? error.message
          : "Unable to prepare the selected Swapr assets.",
      );

      if (temporaryObjects.length) {
        await deleteObjectsFromR2(temporaryObjects).catch(() => null);
        temporaryObjects = [];
      }
    } finally {
      setIsPreparingSource(false);
    }
  };

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <DashboardPageHeader
          eyebrow="UGC swapping"
          title="Create UGC"
          description="Create new UGC from an avatar photo and existing UGC."
        />

        {library.error || photoLibrary.error || assetLoadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {library.error ?? photoLibrary.error ?? assetLoadError}
          </div>
        ) : null}

        {hasSwaprInputs ? (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
            <Panel className="min-w-0 p-4">
              <div className="grid gap-4">
                <div className="grid gap-3 border-b border-border pb-4 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-end">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-accent-dark">
                      Swapr
                    </p>
                    <h2 className="mt-0.5 text-base font-bold text-text-primary">
                      Choose two inputs
                    </h2>
                  </div>
                  <AvatarFilterSelect
                    avatars={photoLibrary.avatars}
                    label="Avatar"
                    value={photoAvatarFilterId}
                    onChange={setPhotoAvatarFilterId}
                  />
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <SwaprPhotoSelector
                    avatars={photoLibrary.avatars}
                    photos={visiblePhotos}
                    selectedPhotoId={selectedPhotoId}
                    onSelect={selectPhoto}
                  />
                  <SwaprSourceClipSelector
                    clips={sourceClips}
                    selectedClipId={selectedClipId}
                    onLoadClip={loadSourceClip}
                    onLoadPoster={loadSourcePoster}
                    onSelect={selectClip}
                  />
                </div>
                <SwaprControlsPanel
                  prompt={prompt}
                  mode={mode}
                  characterOrientation={characterOrientation}
                  keepOriginalSound={keepOriginalSound}
                  hasConsent={hasConsent}
                  selectedClip={selectedClip}
                  isGenerating={generator.isGenerating || isPreparingSource}
                  isReady={isReady}
                  referenceVideoMaxSizeBytes={SWAPR_REFERENCE_VIDEO_MAX_SIZE_BYTES}
                  onPromptChange={setPrompt}
                  onModeChange={setMode}
                  onCharacterOrientationChange={setCharacterOrientation}
                  onKeepOriginalSoundChange={setKeepOriginalSound}
                  onConsentChange={setHasConsent}
                  onGenerate={() => void handleGenerate()}
                />
              </div>
            </Panel>

            <div className="min-w-0 w-full max-w-[340px] justify-self-center xl:sticky xl:top-5 xl:justify-self-end">
              <SwaprOutputPanel
                status={generator.status}
                progress={generator.progress}
                error={generator.error}
                generatedClip={generator.generatedClip}
              />
            </div>
          </div>
        ) : (
          <SwaprEmptyState
            hasPhotos={hasPhotos}
            hasSourceClips={hasSourceClips}
          />
        )}
      </div>
    </DashboardShell>
  );
}
