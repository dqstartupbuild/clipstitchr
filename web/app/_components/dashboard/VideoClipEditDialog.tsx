"use client";

import { Crop, Save, X } from "lucide-react";
import { useState } from "react";
import { VideoCropEditor } from "@/app/_components/crop/VideoCropEditor";
import { CliprMusicControls } from "@/app/_components/dashboard/CliprMusicControls";
import { VideoClipMusicPreview } from "@/app/_components/dashboard/VideoClipMusicPreview";
import { VideoTrimEditor } from "@/app/_components/trim/VideoTrimEditor";
import { AssetTagEditor } from "@/app/_components/uploads/AssetTagEditor";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { DashboardDialogViewport } from "@/app/_components/ui/DashboardDialogViewport";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import { useVideoClipDetailsMusic } from "@/lib/clipstitchr/hooks/useVideoClipDetailsMusic";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { QuickEditCrop } from "@/lib/clipstitchr/types/QuickEditCrop";
import type { VideoClipDetailsMusicEditor } from "@/lib/clipstitchr/types/VideoClipDetailsMusicEditor";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { areVideoTrimRangesEqual } from "@/lib/clipstitchr/utils/areVideoTrimRangesEqual";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { createQuickEditSuggestionsFromMetadata } from "@/lib/clipstitchr/utils/createQuickEditSuggestionsFromMetadata";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
import { getManualCropForSave } from "@/lib/clipstitchr/utils/getManualCropForSave";
import { getVideoClipBadgeLabel } from "@/lib/clipstitchr/utils/getVideoClipBadgeLabel";
import { getVideoTrimDisplayDuration } from "@/lib/clipstitchr/utils/getVideoTrimDisplayDuration";
import { normalizeAssetTagsWithRequiredTag } from "@/lib/clipstitchr/utils/normalizeAssetTagsWithRequiredTag";

type VideoClipEditDialogTrimEditor = {
  initialTrimRange: VideoTrimRange;
  saveLabel: string;
  title: string;
  onSave: (trimRange: VideoTrimRange) => void | Promise<void>;
};

type VideoClipEditDialogProps = {
  clip: VideoClipMetadata;
  isLoading: boolean;
  musicEditor?: VideoClipDetailsMusicEditor;
  posterUrl: string | null;
  productName?: string;
  products?: ProductProfile[];
  trimEditor?: VideoClipEditDialogTrimEditor;
  videoUrl: string | null;
  onClose: () => void;
  onLoadPreview: () => void;
  onSaveCrop?: (crop: QuickEditCrop | null) => void | Promise<void>;
  onSaveMetadata: (metadata: AssetMetadataUpdate) => void | Promise<void>;
};

export function VideoClipEditDialog({
  clip,
  isLoading,
  musicEditor,
  posterUrl,
  productName,
  products = [],
  trimEditor,
  videoUrl,
  onClose,
  onLoadPreview,
  onSaveCrop,
  onSaveMetadata,
}: VideoClipEditDialogProps) {
  const defaultTrimRange = getDefaultVideoTrimRange(clip);
  const quickEdit = createQuickEditSuggestionsFromMetadata(clip.quickEdit);
  const initialTrimRange = trimEditor?.initialTrimRange ?? defaultTrimRange;
  const [activeTrimRange, setActiveTrimRange] = useState(() =>
    clampVideoTrimRange(initialTrimRange, clip.duration),
  );
  const [isCropEditorOpen, setIsCropEditorOpen] = useState(false);
  const [crop, setCrop] = useState<QuickEditCrop>(() => ({
    mode: "smart-9x16",
    positionX: quickEdit?.crop?.positionX ?? 0,
    positionY: quickEdit?.crop?.positionY ?? 0,
    scale: quickEdit?.crop?.scale ?? 1,
  }));
  const [savedTrimRange, setSavedTrimRange] = useState(() =>
    clampVideoTrimRange(initialTrimRange, clip.duration),
  );
  const [savedCropKey, setSavedCropKey] = useState(() =>
    JSON.stringify(quickEdit?.crop ?? null),
  );
  const [name, setName] = useState(clip.name);
  const [tags, setTags] = useState(() =>
    normalizeAssetTagsWithRequiredTag(clip.tags ?? [], clip.clipType),
  );
  const [videoDescription, setVideoDescription] = useState(
    clip.videoDescription ?? "",
  );
  const [mainPersonDescription, setMainPersonDescription] = useState(
    clip.mainPersonDescription ?? "",
  );
  const [outfitDescription, setOutfitDescription] = useState(
    clip.outfitDescription ?? "",
  );
  const [poseDescription, setPoseDescription] = useState(
    clip.poseDescription ?? "",
  );
  const [locationDescription, setLocationDescription] = useState(
    clip.locationDescription ?? "",
  );
  const [productDescription, setProductDescription] = useState(
    clip.productDescription ?? "",
  );
  const [productId, setProductId] = useState(() =>
    products.some((product) => product.id === clip.productId)
      ? (clip.productId ?? "")
      : "",
  );
  const musicState = useVideoClipDetailsMusic({ clip, musicEditor });
  const shouldShowProductDescription = clip.clipType === "demo";
  const shouldShowPersonFields = clip.clipType === "ugc";
  const shouldShowProductSelect = products.length > 0;
  const trimmedName = name.trim();
  const currentMetadata: AssetMetadataUpdate = {
    locationDescription: locationDescription.trim(),
    mainPersonDescription: shouldShowPersonFields
      ? mainPersonDescription.trim()
      : undefined,
    name: trimmedName,
    outfitDescription: shouldShowPersonFields
      ? outfitDescription.trim()
      : undefined,
    poseDescription: poseDescription.trim(),
    productDescription: shouldShowProductDescription
      ? productDescription.trim()
      : undefined,
    ...(shouldShowProductSelect ? { productId } : {}),
    tags: normalizeAssetTagsWithRequiredTag(tags, clip.clipType),
    videoDescription: videoDescription.trim(),
  };
  const currentMetadataKey = JSON.stringify(currentMetadata);
  const [savedMetadataKey, setSavedMetadataKey] = useState(
    () => currentMetadataKey,
  );
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const canSaveMetadata =
    trimmedName.length > 0 && (!shouldShowProductSelect || productId.length > 0);
  const hasMetadataChanges = currentMetadataKey !== savedMetadataKey;
  const hasTrimChanges =
    Boolean(trimEditor) && !areVideoTrimRangesEqual(activeTrimRange, savedTrimRange);
  const currentCropKey = JSON.stringify(getManualCropForSave(crop));
  const hasCropChanges = Boolean(onSaveCrop) && currentCropKey !== savedCropKey;
  const hasChanges =
    hasMetadataChanges ||
    hasTrimChanges ||
    hasCropChanges ||
    musicState.hasUnsavedChanges;
  const canSaveChanges =
    canSaveMetadata && hasChanges && !isSavingChanges && !musicState.isSaving;
  const displayDuration = getVideoTrimDisplayDuration(
    clip.duration,
    activeTrimRange,
  );

  const handleCancelTrim = () => {
    setActiveTrimRange(savedTrimRange);
  };

  const handleSaveTrim = async (trimRange: VideoTrimRange) => {
    if (!trimEditor) {
      return;
    }

    const clampedTrimRange = clampVideoTrimRange(trimRange, clip.duration);

    await trimEditor.onSave(clampedTrimRange);
    setActiveTrimRange(clampedTrimRange);
    setSavedTrimRange(clampedTrimRange);
  };

  const handleSaveChanges = async () => {
    if (!canSaveChanges) {
      return;
    }

    setIsSavingChanges(true);

    try {
      if (hasMetadataChanges) {
        await onSaveMetadata(currentMetadata);
        setSavedMetadataKey(currentMetadataKey);
      }

      if (trimEditor && hasTrimChanges) {
        await handleSaveTrim(activeTrimRange);
      }

      if (onSaveCrop && hasCropChanges) {
        const nextCrop = getManualCropForSave(crop);

        await onSaveCrop(nextCrop);
        setSavedCropKey(JSON.stringify(nextCrop));
      }

      if (musicState.hasUnsavedChanges) {
        await musicState.saveMusic();
      }
    } finally {
      setIsSavingChanges(false);
    }
  };

  return (
    <DashboardDialogViewport onClose={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-clip-edit-dialog-title"
        className="w-full max-w-[calc(100vw-1rem)] min-w-0 rounded-lg bg-white shadow-xl sm:max-w-5xl"
      >
        <div className="flex min-w-0 items-start justify-between gap-4 border-b border-border p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">Edit clip</p>
            <h2
              id="video-clip-edit-dialog-title"
              className="mt-1 truncate text-xl font-bold text-text-primary"
            >
              {clip.name}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              size="sm"
              icon={<Save aria-hidden className="h-4 w-4" />}
              isLoading={isSavingChanges || musicState.isSaving}
              disabled={!canSaveChanges}
              onClick={() => void handleSaveChanges()}
            >
              Save changes
            </Button>
            <IconButton
              type="button"
              label="Close clip editor"
              icon={<X aria-hidden className="h-4 w-4" />}
              onClick={onClose}
            />
          </div>
        </div>
        <div className="grid min-w-0 max-w-full gap-4 p-4 sm:gap-5 sm:p-5 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-4">
            <VideoClipMusicPreview
              src={videoUrl}
              posterSrc={posterUrl}
              label={clip.name}
              autoPlay
              hasSourceAudio={clip.hasAudio}
              isLoading={isLoading}
              musicBlob={musicState.musicBlob}
              musicEnabled={musicState.musicEnabled}
              musicVolume={musicState.musicVolume}
              quickEdit={quickEdit}
              sourceDuration={clip.duration}
              trimRange={activeTrimRange}
              onLoadPreview={onLoadPreview}
            />
            {onSaveCrop ? (
              <div className="grid gap-3">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  icon={<Crop aria-hidden className="h-4 w-4" />}
                  onClick={() => setIsCropEditorOpen((isOpen) => !isOpen)}
                >
                  Crop
                </Button>
                {isCropEditorOpen ? (
                  <VideoCropEditor
                    crop={crop}
                    label={`Crop ${clip.name}`}
                    mediaSrc={videoUrl}
                    posterSrc={posterUrl}
                    onChange={setCrop}
                    onReset={() =>
                      setCrop({
                        mode: "smart-9x16",
                        positionX: 0,
                        positionY: 0,
                        scale: 1,
                      })
                    }
                  />
                ) : null}
              </div>
            ) : null}
            <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface-elevated p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-md border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-semibold text-accent-dark">
                  {getVideoClipBadgeLabel(clip)}
                </span>
                <span className="text-xs font-semibold text-text-tertiary">
                  {clip.hasAudio ? "Audio" : "No audio"}
                </span>
              </div>
              <p className="mt-3 break-words text-sm font-semibold text-text-primary [overflow-wrap:anywhere]">
                {clip.width} x {clip.height} . {formatDuration(displayDuration)}
              </p>
              <p className="mt-1 text-xs text-text-tertiary">
                {formatBytes(clip.size)}
              </p>
              {productName ? (
                <p className="mt-2 break-words text-xs font-semibold text-text-secondary [overflow-wrap:anywhere]">
                  {productName}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <section className="min-w-0 overflow-hidden rounded-lg border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-text-primary">
                  Details
                </h3>
              </div>
              <div className="mt-4 grid min-w-0 gap-4 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="text-sm font-semibold text-text-primary">
                    Title
                  </span>
                  <input
                    type="text"
                    value={name}
                    className="mt-2 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent"
                    onChange={(event) => setName(event.currentTarget.value)}
                  />
                </label>
                <div className="md:col-span-2">
                  <AssetTagEditor
                    tags={tags}
                    requiredTag={clip.clipType}
                    onChange={setTags}
                  />
                </div>
                {shouldShowProductSelect ? (
                  <div className="md:col-span-2">
                    <SelectInput
                      label="Product"
                      options={[
                        { label: "Select product", value: "" },
                        ...products.map((product) => ({
                          label: product.name,
                          value: product.id,
                        })),
                      ]}
                      value={productId}
                      onChange={(event) =>
                        setProductId(event.currentTarget.value)
                      }
                    />
                  </div>
                ) : null}
                <label className="block md:col-span-2">
                  <span className="text-sm font-semibold text-text-primary">
                    {shouldShowProductDescription
                      ? "Demo description"
                      : "Video description"}
                  </span>
                  <textarea
                    value={videoDescription}
                    rows={3}
                    className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors focus:border-accent"
                    onChange={(event) =>
                      setVideoDescription(event.currentTarget.value)
                    }
                  />
                </label>
                {shouldShowProductDescription ? (
                  <label className="block md:col-span-2">
                    <span className="text-sm font-semibold text-text-primary">
                      Product description
                    </span>
                    <textarea
                      value={productDescription}
                      rows={3}
                      className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors focus:border-accent"
                      onChange={(event) =>
                        setProductDescription(event.currentTarget.value)
                      }
                    />
                  </label>
                ) : null}
                {shouldShowPersonFields ? (
                  <>
                    <label className="block">
                      <span className="text-sm font-semibold text-text-primary">
                        Main person
                      </span>
                      <textarea
                        value={mainPersonDescription}
                        rows={3}
                        className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors focus:border-accent"
                        onChange={(event) =>
                          setMainPersonDescription(event.currentTarget.value)
                        }
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold text-text-primary">
                        Outfit
                      </span>
                      <textarea
                        value={outfitDescription}
                        rows={3}
                        className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors focus:border-accent"
                        onChange={(event) =>
                          setOutfitDescription(event.currentTarget.value)
                        }
                      />
                    </label>
                  </>
                ) : null}
                <label className="block">
                  <span className="text-sm font-semibold text-text-primary">
                    {shouldShowProductDescription ? "Demo action" : "Pose or action"}
                  </span>
                  <textarea
                    value={poseDescription}
                    rows={3}
                    className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors focus:border-accent"
                    onChange={(event) =>
                      setPoseDescription(event.currentTarget.value)
                    }
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-text-primary">
                    Location
                  </span>
                  <textarea
                    value={locationDescription}
                    rows={3}
                    className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors focus:border-accent"
                    onChange={(event) =>
                      setLocationDescription(event.currentTarget.value)
                    }
                  />
                </label>
              </div>
            </section>
            {trimEditor ? (
              <VideoTrimEditor
                duration={clip.duration}
                title={trimEditor.title}
                saveLabel={trimEditor.saveLabel}
                showActions={false}
                value={activeTrimRange}
                onCancel={handleCancelTrim}
                onChange={setActiveTrimRange}
                onSave={handleSaveTrim}
              />
            ) : null}
            {musicEditor ? (
              <CliprMusicControls
                enabled={musicState.musicEnabled}
                error={musicState.error}
                hasUnsavedChanges={musicState.hasUnsavedChanges}
                isLoadingPreview={musicState.isMusicLoading}
                isSaving={musicState.isSaving}
                music={musicState.music}
                showSaveButton={false}
                volume={musicState.musicVolume}
                onEnabledChange={musicState.setMusicEnabled}
                onRemove={() => void musicState.removeMusic()}
                onSave={() => void musicState.saveMusic()}
                onSelectTrack={(track) => void musicState.selectMusicTrack(track)}
                onVolumeChange={musicState.setMusicVolume}
              />
            ) : null}
          </div>
        </div>
      </div>
    </DashboardDialogViewport>
  );
}
