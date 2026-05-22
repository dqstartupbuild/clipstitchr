"use client";

import { Save, X } from "lucide-react";
import { useState } from "react";
import { CliprMusicControls } from "@/app/_components/dashboard/CliprMusicControls";
import { VideoClipMusicPreview } from "@/app/_components/dashboard/VideoClipMusicPreview";
import { VideoTrimEditor } from "@/app/_components/trim/VideoTrimEditor";
import { AssetTagEditor } from "@/app/_components/uploads/AssetTagEditor";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import { useVideoClipDetailsMusic } from "@/lib/clipstitchr/hooks/useVideoClipDetailsMusic";
import type { AssetMetadataUpdate } from "@/lib/clipstitchr/types/AssetMetadataUpdate";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { VideoClipDetailsMusicEditor } from "@/lib/clipstitchr/types/VideoClipDetailsMusicEditor";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
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
  onSaveMetadata,
}: VideoClipEditDialogProps) {
  const defaultTrimRange = getDefaultVideoTrimRange(clip);
  const initialTrimRange = trimEditor?.initialTrimRange ?? defaultTrimRange;
  const [activeTrimRange, setActiveTrimRange] = useState(() =>
    clampVideoTrimRange(initialTrimRange, clip.duration),
  );
  const [savedTrimRange, setSavedTrimRange] = useState(() =>
    clampVideoTrimRange(initialTrimRange, clip.duration),
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
  const [isSavingMetadata, setIsSavingMetadata] = useState(false);
  const musicState = useVideoClipDetailsMusic({ clip, musicEditor });
  const shouldShowProductFields = clip.clipType === "demo";
  const shouldShowPersonFields = clip.clipType === "ugc";
  const shouldShowProductSelect = shouldShowProductFields && products.length > 0;
  const trimmedName = name.trim();
  const canSaveMetadata =
    trimmedName.length > 0 && (!shouldShowProductSelect || productId.length > 0);
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

  const handleSaveMetadata = async () => {
    if (!canSaveMetadata) {
      return;
    }

    setIsSavingMetadata(true);

    try {
      await onSaveMetadata({
        locationDescription: locationDescription.trim(),
        mainPersonDescription: shouldShowPersonFields
          ? mainPersonDescription.trim()
          : undefined,
        name: trimmedName,
        outfitDescription: shouldShowPersonFields
          ? outfitDescription.trim()
          : undefined,
        poseDescription: poseDescription.trim(),
        productDescription: shouldShowProductFields
          ? productDescription.trim()
          : undefined,
        ...(shouldShowProductFields && shouldShowProductSelect
          ? { productId }
          : {}),
        tags: normalizeAssetTagsWithRequiredTag(tags, clip.clipType),
        videoDescription: videoDescription.trim(),
      });
    } finally {
      setIsSavingMetadata(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-clip-edit-dialog-title"
        className="max-h-full w-full max-w-5xl overflow-y-auto rounded-lg bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">Edit clip</p>
            <h2
              id="video-clip-edit-dialog-title"
              className="mt-1 truncate text-xl font-bold text-text-primary"
            >
              {clip.name}
            </h2>
          </div>
          <IconButton
            type="button"
            label="Close clip editor"
            icon={<X aria-hidden className="h-4 w-4" />}
            onClick={onClose}
          />
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
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
              trimRange={activeTrimRange}
              onLoadPreview={onLoadPreview}
            />
            <div className="rounded-lg border border-border bg-surface-elevated p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-md border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-semibold text-accent-dark">
                  {getVideoClipBadgeLabel(clip)}
                </span>
                <span className="text-xs font-semibold text-text-tertiary">
                  {clip.hasAudio ? "Audio" : "No audio"}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-text-primary">
                {clip.width} x {clip.height} . {formatDuration(displayDuration)}
              </p>
              <p className="mt-1 text-xs text-text-tertiary">
                {formatBytes(clip.size)}
              </p>
              {productName ? (
                <p className="mt-2 text-xs font-semibold text-text-secondary">
                  {productName}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <section className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-text-primary">
                  Details
                </h3>
                <Button
                  type="button"
                  size="sm"
                  icon={<Save aria-hidden className="h-4 w-4" />}
                  isLoading={isSavingMetadata}
                  disabled={!canSaveMetadata}
                  onClick={() => void handleSaveMetadata()}
                >
                  Save details
                </Button>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
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
                    {shouldShowProductFields
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
                {shouldShowProductFields ? (
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
                    {shouldShowProductFields ? "Demo action" : "Pose or action"}
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
                isGenerating={musicState.isGenerating}
                isLoadingPreview={musicState.isMusicLoading}
                isSaving={musicState.isSaving}
                music={musicState.music}
                volume={musicState.musicVolume}
                onEnabledChange={musicState.setMusicEnabled}
                onGenerate={() => void musicState.generateMusic()}
                onRemove={() => void musicState.removeMusic()}
                onSave={() => void musicState.saveMusic()}
                onSelectTrack={(track) => void musicState.selectMusicTrack(track)}
                onVolumeChange={musicState.setMusicVolume}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
