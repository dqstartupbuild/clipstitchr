"use client";

import { Crop, Save, X } from "lucide-react";
import { useMemo, useState } from "react";
import { VideoCropEditor } from "@/app/_components/crop/VideoCropEditor";
import { StitchSourceSettingsPanel } from "@/app/_components/dashboard/StitchSourceSettingsPanel";
import { StitchSequencePreview } from "@/app/_components/dashboard/StitchSequencePreview";
import { MusicSelectorButton } from "@/app/_components/music/MusicSelectorButton";
import { StitchSocialCaptionField } from "@/app/_components/stitches/StitchSocialCaptionField";
import { TextOverlayEditor } from "@/app/_components/stitchr/TextOverlayEditor";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { useObjectUrl } from "@/lib/clipstitchr/hooks/useObjectUrl";
import type { QuickEditCrop } from "@/lib/clipstitchr/types/QuickEditCrop";
import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { StitchMusicMetadata } from "@/lib/clipstitchr/types/StitchMusicMetadata";
import type { StitchPreviewErrorState } from "@/lib/clipstitchr/types/StitchPreviewErrorState";
import type { StitchPreviewSources } from "@/lib/clipstitchr/types/StitchPreviewSources";
import type { StitchSourceSettingsUpdate } from "@/lib/clipstitchr/types/StitchSourceSettingsUpdate";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import { clampTextOverlays } from "@/lib/clipstitchr/utils/clampTextOverlays";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { createMusicMetadataComparisonKey } from "@/lib/clipstitchr/utils/createMusicMetadataComparisonKey";
import { createQuickEditRemoveRangesComparisonKey } from "@/lib/clipstitchr/utils/createQuickEditRemoveRangesComparisonKey";
import { createStitchPreviewCacheKey } from "@/lib/clipstitchr/utils/createStitchPreviewCacheKey";
import { createStitchMusicMetadataFromSharedTrack } from "@/lib/clipstitchr/utils/createStitchMusicMetadataFromSharedTrack";
import { createStitchSourceSettingsComparisonKey } from "@/lib/clipstitchr/utils/createStitchSourceSettingsComparisonKey";
import { createTextOverlaysComparisonKey } from "@/lib/clipstitchr/utils/createTextOverlaysComparisonKey";
import { findVideoClipMetadataById } from "@/lib/clipstitchr/utils/findVideoClipMetadataById";
import { formatBytes } from "@/lib/clipstitchr/utils/formatBytes";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
import { getDownloadFileName } from "@/lib/clipstitchr/utils/getDownloadFileName";
import { getManualCropForSave } from "@/lib/clipstitchr/utils/getManualCropForSave";
import { getNonEmptyTextOverlays } from "@/lib/clipstitchr/utils/getNonEmptyTextOverlays";
import { getQuickEditPlaybackDuration } from "@/lib/clipstitchr/utils/getQuickEditPlaybackDuration";
import { getQuickEditSuggestionsWithReplacedRemoveRanges } from "@/lib/clipstitchr/utils/getQuickEditSuggestionsWithReplacedRemoveRanges";
import { getQuickEditSuggestionsWithCrop } from "@/lib/clipstitchr/utils/getQuickEditSuggestionsWithCrop";
import { getStitchIsLongr } from "@/lib/clipstitchr/utils/getStitchIsLongr";
import { getStitchTrimRangeLabel } from "@/lib/clipstitchr/utils/getStitchTrimRangeLabel";
import { getTextOverlayList } from "@/lib/clipstitchr/utils/getTextOverlayList";
import { normalizeQuickEditRemoveRanges } from "@/lib/clipstitchr/utils/normalizeQuickEditRemoveRanges";

type StitchEditDialogProps = {
  demoClips: VideoClipMetadata[];
  isLoadingPreview: boolean;
  isSavingMusic: boolean;
  isSavingSocialCaption: boolean;
  isSavingSourceSettings: boolean;
  isSavingText: boolean;
  musicError: string | null;
  posterUrl: string | null;
  previewErrorState: StitchPreviewErrorState | null;
  previewSources: StitchPreviewSources | null;
  sourceSettingsError: string | null;
  socialCaptionError: string | null;
  stitch: Stitch;
  textError: string | null;
  ugcClips: VideoClipMetadata[];
  onClose: () => void;
  onLoadPreview: (ugcClipId?: string, demoClipId?: string) => void;
  onRemoveMusic: () => Promise<void>;
  onSaveMusic: (music: StitchMusicMetadata) => Promise<void>;
  onSaveSocialCaption: (
    socialCaption: string | null,
    stitchOverride?: Stitch,
  ) => Promise<void>;
  onSaveSourceSettings: (
    update: StitchSourceSettingsUpdate,
    stitchOverride?: Stitch,
  ) => Promise<void>;
  onSaveSourceCrop?: (
    source: "ugc" | "demo",
    crop: QuickEditCrop | null,
    stitchOverride?: Stitch,
  ) => Promise<void>;
  onSaveSourceCuts?: (
    source: "ugc" | "demo",
    removeRanges: QuickEditRemoveRange[],
    stitchOverride?: Stitch,
  ) => Promise<void>;
  onSaveTextOverlay: (
    textOverlay: TextOverlay | TextOverlay[] | null,
    stitchOverride?: Stitch,
  ) => Promise<void>;
};

export function StitchEditDialog({
  demoClips,
  isLoadingPreview,
  isSavingMusic,
  isSavingSocialCaption,
  isSavingSourceSettings,
  isSavingText,
  musicError,
  posterUrl,
  previewErrorState,
  previewSources,
  sourceSettingsError,
  socialCaptionError,
  stitch,
  textError,
  ugcClips,
  onClose,
  onLoadPreview,
  onRemoveMusic,
  onSaveMusic,
  onSaveSocialCaption,
  onSaveSourceSettings,
  onSaveSourceCrop,
  onSaveSourceCuts,
  onSaveTextOverlay,
}: StitchEditDialogProps) {
  const isLongrStitch = getStitchIsLongr(stitch);
  const currentUgcFallbackClip = {
    id: stitch.ugcClipId,
    name: stitch.ugcClipName,
  };
  const currentDemoFallbackClip = {
    id: stitch.demoClipId,
    name: stitch.demoClipName,
  };
  const sourceUgcClips = useMemo(
    () =>
      previewSources?.ugcClip
        ? [previewSources.ugcClip, ...ugcClips]
        : ugcClips,
    [previewSources, ugcClips],
  );
  const sourceDemoClips = useMemo(
    () =>
      previewSources?.demoClip
        ? [previewSources.demoClip, ...demoClips]
        : demoClips,
    [previewSources, demoClips],
  );
  const initialUgcClip = findVideoClipMetadataById(
    sourceUgcClips,
    stitch.ugcClipId,
  );
  const initialDemoClip = findVideoClipMetadataById(
    sourceDemoClips,
    stitch.demoClipId,
  );
  const initialTextOverlays = getTextOverlayList(
    stitch.textOverlays,
    stitch.textOverlay,
  );
  const initialUgcTrimRange = initialUgcClip
    ? clampVideoTrimRange(
        stitch.ugcTrimRange ?? getDefaultVideoTrimRange(initialUgcClip),
        initialUgcClip.duration,
      )
    : (stitch.ugcTrimRange ?? { start: 0, end: 0 });
  const initialDemoTrimRange = initialDemoClip
    ? clampVideoTrimRange(
        stitch.demoTrimRange ?? getDefaultVideoTrimRange(initialDemoClip),
        initialDemoClip.duration,
      )
    : (stitch.demoTrimRange ?? { start: 0, end: 0 });
  const initialSourceSettingsKey = createStitchSourceSettingsComparisonKey({
    demoClipId: stitch.demoClipId,
    demoPlaybackRate: stitch.demoPlaybackRate ?? 1,
    demoTrimRange: initialDemoTrimRange,
    ugcClipId: stitch.ugcClipId,
    ugcPlaybackRate: stitch.ugcPlaybackRate ?? 1,
    ugcTrimRange: initialUgcTrimRange,
  });
  const initialTextOverlaysKey = createTextOverlaysComparisonKey(
    getNonEmptyTextOverlays(
      clampTextOverlays(initialTextOverlays, stitch.duration),
    ),
  );
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>(
    () => initialTextOverlays,
  );
  const [activeTextOverlayId, setActiveTextOverlayId] = useState<string | null>(
    null,
  );
  const [music, setMusic] = useState<StitchMusicMetadata | null>(
    stitch.music ?? null,
  );
  const [socialCaption, setSocialCaption] = useState(
    () => stitch.socialCaption ?? "",
  );
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(music?.enabled ?? true);
  const [volume, setVolume] = useState(music?.volume ?? 1);
  const [selectedUgcClipId, setSelectedUgcClipId] = useState(
    stitch.ugcClipId,
  );
  const [selectedDemoClipId, setSelectedDemoClipId] = useState(
    stitch.demoClipId,
  );
  const [ugcTrimRange, setUgcTrimRange] = useState(() => initialUgcTrimRange);
  const [demoTrimRange, setDemoTrimRange] = useState(() => initialDemoTrimRange);
  const [ugcRemoveRanges, setUgcRemoveRanges] = useState<
    QuickEditRemoveRange[]
  >(() => stitch.ugcQuickEdit?.removeRanges ?? []);
  const [demoRemoveRanges, setDemoRemoveRanges] = useState<
    QuickEditRemoveRange[]
  >(() => stitch.demoQuickEdit?.removeRanges ?? []);
  const [isUgcCropOpen, setIsUgcCropOpen] = useState(false);
  const [isDemoCropOpen, setIsDemoCropOpen] = useState(false);
  const [ugcCrop, setUgcCrop] = useState<QuickEditCrop>(() => ({
    mode: "smart-9x16",
    positionX: stitch.ugcQuickEdit?.crop?.positionX ?? 0,
    positionY: stitch.ugcQuickEdit?.crop?.positionY ?? 0,
    scale: stitch.ugcQuickEdit?.crop?.scale ?? 1,
  }));
  const [demoCrop, setDemoCrop] = useState<QuickEditCrop>(() => ({
    mode: "smart-9x16",
    positionX: stitch.demoQuickEdit?.crop?.positionX ?? 0,
    positionY: stitch.demoQuickEdit?.crop?.positionY ?? 0,
    scale: stitch.demoQuickEdit?.crop?.scale ?? 1,
  }));
  const [ugcPlaybackRate, setUgcPlaybackRate] = useState<VideoPlaybackRate>(
    stitch.ugcPlaybackRate ?? 1,
  );
  const [demoPlaybackRate, setDemoPlaybackRate] = useState<VideoPlaybackRate>(
    stitch.demoPlaybackRate ?? 1,
  );
  const [savedSourceSettingsKey, setSavedSourceSettingsKey] = useState(
    () => initialSourceSettingsKey,
  );
  const [savedUgcRemoveRangesKey, setSavedUgcRemoveRangesKey] = useState(() =>
    createQuickEditRemoveRangesComparisonKey(
      stitch.ugcQuickEdit?.removeRanges ?? [],
      initialUgcClip?.duration ?? stitch.ugcTrimRange?.end ?? 0,
    ),
  );
  const [savedDemoRemoveRangesKey, setSavedDemoRemoveRangesKey] = useState(() =>
    createQuickEditRemoveRangesComparisonKey(
      stitch.demoQuickEdit?.removeRanges ?? [],
      initialDemoClip?.duration ?? stitch.demoTrimRange?.end ?? 0,
    ),
  );
  const [savedTextOverlaysKey, setSavedTextOverlaysKey] = useState(
    () => initialTextOverlaysKey,
  );
  const [savedUgcCropKey, setSavedUgcCropKey] = useState(() =>
    JSON.stringify(stitch.ugcQuickEdit?.crop ?? null),
  );
  const [savedDemoCropKey, setSavedDemoCropKey] = useState(() =>
    JSON.stringify(stitch.demoQuickEdit?.crop ?? null),
  );
  const [savedMusicKey, setSavedMusicKey] = useState(() =>
    createMusicMetadataComparisonKey(stitch.music ?? null),
  );
  const [savedSocialCaption, setSavedSocialCaption] = useState(
    () => stitch.socialCaption ?? "",
  );
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const selectedUgcClip = findVideoClipMetadataById(
    sourceUgcClips,
    selectedUgcClipId,
  );
  const selectedDemoClip = findVideoClipMetadataById(
    sourceDemoClips,
    selectedDemoClipId,
  );
  const clampedUgcTrimRange = selectedUgcClip
    ? clampVideoTrimRange(ugcTrimRange, selectedUgcClip.duration)
    : ugcTrimRange;
  const clampedDemoTrimRange = selectedDemoClip
    ? clampVideoTrimRange(demoTrimRange, selectedDemoClip.duration)
    : demoTrimRange;
  const normalizedUgcRemoveRanges = selectedUgcClip
    ? normalizeQuickEditRemoveRanges(ugcRemoveRanges, selectedUgcClip.duration)
    : ugcRemoveRanges;
  const normalizedDemoRemoveRanges = selectedDemoClip
    ? normalizeQuickEditRemoveRanges(
        demoRemoveRanges,
        selectedDemoClip.duration,
      )
    : demoRemoveRanges;
  const baseUgcQuickEdit =
    selectedUgcClipId === stitch.ugcClipId ? stitch.ugcQuickEdit : undefined;
  const baseDemoQuickEdit =
    selectedDemoClipId === stitch.demoClipId ? stitch.demoQuickEdit : undefined;
  const draftUgcQuickEdit = getQuickEditSuggestionsWithCrop(
    getQuickEditSuggestionsWithReplacedRemoveRanges({
      duration: selectedUgcClip?.duration ?? 0,
      quickEdit: baseUgcQuickEdit,
      removeRanges: normalizedUgcRemoveRanges,
    }),
    getManualCropForSave(ugcCrop),
  );
  const draftDemoQuickEdit = getQuickEditSuggestionsWithCrop(
    getQuickEditSuggestionsWithReplacedRemoveRanges({
      duration: selectedDemoClip?.duration ?? 0,
      quickEdit: baseDemoQuickEdit,
      removeRanges: normalizedDemoRemoveRanges,
    }),
    getManualCropForSave(demoCrop),
  );
  const ugcDuration = selectedUgcClip
    ? getQuickEditPlaybackDuration(
        clampedUgcTrimRange,
        selectedUgcClip.duration,
        draftUgcQuickEdit?.removeRanges,
        ugcPlaybackRate,
      )
    : 0;
  const demoDuration = selectedDemoClip
    ? getQuickEditPlaybackDuration(
        clampedDemoTrimRange,
        selectedDemoClip.duration,
        draftDemoQuickEdit?.removeRanges,
        demoPlaybackRate,
      )
    : 0;
  const sourceDuration = ugcDuration + demoDuration;
  const selectedPreviewCacheKey = createStitchPreviewCacheKey(
    stitch.id,
    selectedUgcClipId,
    selectedDemoClipId,
  );
  const selectedPreviewSources =
    previewSources?.cacheKey === selectedPreviewCacheKey
      ? previewSources
      : null;
  const ugcCropVideoUrl = useObjectUrl(selectedPreviewSources?.ugcClip.blob);
  const demoCropVideoUrl = useObjectUrl(selectedPreviewSources?.demoClip.blob);
  const selectedPreviewError =
    previewErrorState?.cacheKey === selectedPreviewCacheKey
      ? previewErrorState.message
      : null;
  const draftStitch: Stitch = {
    ...stitch,
    demoClipId: selectedDemoClipId,
    demoClipName: selectedDemoClip?.name ?? stitch.demoClipName,
    demoPlaybackRate,
    demoQuickEdit: draftDemoQuickEdit,
    demoTrimRange: clampedDemoTrimRange,
    duration: selectedUgcClip && selectedDemoClip ? sourceDuration : stitch.duration,
    music: music ?? undefined,
    socialCaption: socialCaption.trim() || undefined,
    textOverlay: textOverlays[0],
    textOverlays: textOverlays.length ? textOverlays : undefined,
    ugcClipId: selectedUgcClipId,
    ugcClipName: selectedUgcClip?.name ?? stitch.ugcClipName,
    ugcPlaybackRate,
    ugcQuickEdit: draftUgcQuickEdit,
    ugcTrimRange: clampedUgcTrimRange,
  };
  const fileSizeLabel = stitch.size
    ? formatBytes(stitch.size)
    : "Ready to download";
  const currentSourceSettingsKey = createStitchSourceSettingsComparisonKey({
    demoClipId: selectedDemoClipId,
    demoPlaybackRate,
    demoTrimRange: clampedDemoTrimRange,
    ugcClipId: selectedUgcClipId,
    ugcPlaybackRate,
    ugcTrimRange: clampedUgcTrimRange,
  });
  const nextTextOverlays = getNonEmptyTextOverlays(
    clampTextOverlays(textOverlays, draftStitch.duration),
  );
  const currentTextOverlaysKey =
    createTextOverlaysComparisonKey(nextTextOverlays);
  const currentMusic = music
    ? {
        ...music,
        enabled,
        volume,
      }
    : null;
  const currentMusicKey = createMusicMetadataComparisonKey(currentMusic);
  const currentSocialCaption = socialCaption.trim();
  const hasSourceChanges =
    !isLongrStitch && currentSourceSettingsKey !== savedSourceSettingsKey;
  const currentUgcRemoveRangesKey = createQuickEditRemoveRangesComparisonKey(
    normalizedUgcRemoveRanges,
    selectedUgcClip?.duration ?? 0,
  );
  const currentDemoRemoveRangesKey = createQuickEditRemoveRangesComparisonKey(
    normalizedDemoRemoveRanges,
    selectedDemoClip?.duration ?? 0,
  );
  const hasTextChanges = currentTextOverlaysKey !== savedTextOverlaysKey;
  const currentUgcCrop = getManualCropForSave(ugcCrop);
  const currentDemoCrop = getManualCropForSave(demoCrop);
  const currentUgcCropKey = JSON.stringify(currentUgcCrop);
  const currentDemoCropKey = JSON.stringify(currentDemoCrop);
  const canEditSourceCuts = !isLongrStitch && Boolean(onSaveSourceCuts);
  const hasUgcCutChanges =
    canEditSourceCuts && currentUgcRemoveRangesKey !== savedUgcRemoveRangesKey;
  const hasDemoCutChanges =
    canEditSourceCuts && currentDemoRemoveRangesKey !== savedDemoRemoveRangesKey;
  const canEditSourceCrop = !isLongrStitch && Boolean(onSaveSourceCrop);
  const hasUgcCropChanges =
    canEditSourceCrop && currentUgcCropKey !== savedUgcCropKey;
  const hasDemoCropChanges =
    canEditSourceCrop && currentDemoCropKey !== savedDemoCropKey;
  const hasMusicChanges = currentMusicKey !== savedMusicKey;
  const hasSocialCaptionChanges =
    currentSocialCaption !== savedSocialCaption.trim();
  const hasChanges =
    hasSourceChanges ||
    hasTextChanges ||
    hasUgcCutChanges ||
    hasDemoCutChanges ||
    hasUgcCropChanges ||
    hasDemoCropChanges ||
    hasMusicChanges ||
    hasSocialCaptionChanges;
  const isSavingAny =
    isSavingChanges ||
    isSavingMusic ||
    isSavingSocialCaption ||
    isSavingSourceSettings ||
    isSavingText;
  const canSaveChanges =
    hasChanges &&
    !isSavingAny &&
    (isLongrStitch || Boolean(selectedUgcClip && selectedDemoClip));
  const createSourceSettingsUpdate = (): StitchSourceSettingsUpdate | null => {
    if (!selectedUgcClip || !selectedDemoClip) {
      return null;
    }

    const nextName =
      selectedUgcClip.id === stitch.ugcClipId &&
      selectedDemoClip.id === stitch.demoClipId
        ? stitch.name
        : getDownloadFileName(selectedUgcClip.name, selectedDemoClip.name);

    return {
      demoClipId: selectedDemoClip.id,
      demoClipName: selectedDemoClip.name,
      demoPlaybackRate,
      demoTrimRange: clampedDemoTrimRange,
      duration: sourceDuration,
      name: nextName,
      ugcClipId: selectedUgcClip.id,
      ugcClipName: selectedUgcClip.name,
      ugcPlaybackRate,
      ugcTrimRange: clampedUgcTrimRange,
    };
  };
  const handleSaveChanges = async () => {
    if (!canSaveChanges) {
      return;
    }

    const sourceSettingsUpdate = createSourceSettingsUpdate();
    const nextMusic = currentMusic
      ? {
          ...currentMusic,
          updatedAt: new Date().toISOString(),
        }
      : null;
    const stitchDraftForSave: Stitch = {
      ...draftStitch,
      demoQuickEdit: getQuickEditSuggestionsWithCrop(
        draftStitch.demoQuickEdit,
        currentDemoCrop,
      ),
      music: nextMusic ?? undefined,
      socialCaption: currentSocialCaption || undefined,
      textOverlay: nextTextOverlays[0],
      textOverlays: nextTextOverlays.length ? nextTextOverlays : undefined,
      ugcQuickEdit: getQuickEditSuggestionsWithCrop(
        draftStitch.ugcQuickEdit,
        currentUgcCrop,
      ),
    };

    setIsSavingChanges(true);

    try {
      if (hasSourceChanges && sourceSettingsUpdate) {
        await onSaveSourceSettings(sourceSettingsUpdate, stitchDraftForSave);
        setDemoTrimRange(clampedDemoTrimRange);
        setUgcTrimRange(clampedUgcTrimRange);
        setSavedSourceSettingsKey(currentSourceSettingsKey);
      }

      if (onSaveSourceCuts && hasUgcCutChanges) {
        await onSaveSourceCuts(
          "ugc",
          normalizedUgcRemoveRanges,
          stitchDraftForSave,
        );
        setUgcRemoveRanges(normalizedUgcRemoveRanges);
        setSavedUgcRemoveRangesKey(currentUgcRemoveRangesKey);
      }

      if (onSaveSourceCuts && hasDemoCutChanges) {
        await onSaveSourceCuts(
          "demo",
          normalizedDemoRemoveRanges,
          stitchDraftForSave,
        );
        setDemoRemoveRanges(normalizedDemoRemoveRanges);
        setSavedDemoRemoveRangesKey(currentDemoRemoveRangesKey);
      }

      if (hasTextChanges) {
        await onSaveTextOverlay(
          nextTextOverlays.length ? nextTextOverlays : null,
          stitchDraftForSave,
        );
        setTextOverlays(nextTextOverlays);
        setSavedTextOverlaysKey(currentTextOverlaysKey);
      }

      if (onSaveSourceCrop && hasUgcCropChanges) {
        await onSaveSourceCrop("ugc", currentUgcCrop, stitchDraftForSave);
        setSavedUgcCropKey(currentUgcCropKey);
      }

      if (onSaveSourceCrop && hasDemoCropChanges) {
        await onSaveSourceCrop("demo", currentDemoCrop, stitchDraftForSave);
        setSavedDemoCropKey(currentDemoCropKey);
      }

      if (hasMusicChanges) {
        if (nextMusic) {
          await onSaveMusic(nextMusic);
        } else {
          await onRemoveMusic();
        }

        setMusic(nextMusic);
        setSavedMusicKey(createMusicMetadataComparisonKey(nextMusic));
      }

      if (hasSocialCaptionChanges) {
        await onSaveSocialCaption(
          currentSocialCaption || null,
          stitchDraftForSave,
        );
        setSocialCaption(currentSocialCaption);
        setSavedSocialCaption(currentSocialCaption);
      }
    } catch {
      return;
    } finally {
      setIsSavingChanges(false);
    }
  };
  const handleSelectUgcClip = (clipId: string) => {
    const nextClip = findVideoClipMetadataById(sourceUgcClips, clipId);

    setSelectedUgcClipId(clipId);

    if (nextClip) {
      setUgcTrimRange(getDefaultVideoTrimRange(nextClip));
    }

    setUgcRemoveRanges([]);
    setUgcCrop({
      mode: "smart-9x16",
      positionX: 0,
      positionY: 0,
      scale: 1,
    });
    onLoadPreview(clipId, selectedDemoClipId);
  };
  const handleSelectDemoClip = (clipId: string) => {
    const nextClip = findVideoClipMetadataById(sourceDemoClips, clipId);

    setSelectedDemoClipId(clipId);

    if (nextClip) {
      setDemoTrimRange(getDefaultVideoTrimRange(nextClip));
    }

    setDemoRemoveRanges([]);
    setDemoCrop({
      mode: "smart-9x16",
      positionX: 0,
      positionY: 0,
      scale: 1,
    });
    onLoadPreview(selectedUgcClipId, clipId);
  };
  const handleSelectTrack = (track: SharedMusicTrack) => {
    const nextMusic = createStitchMusicMetadataFromSharedTrack(track);

    setMusic(nextMusic);
    setEnabled(nextMusic.enabled);
    setVolume(nextMusic.volume);
  };
  const handleRemoveMusic = () => {
    setMusic(null);
  };
  return (
    <div
      className="dashboard-dialog-viewport"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stitch-edit-dialog-title"
        className="flex max-h-full min-h-0 w-full max-w-[calc(100vw-1rem)] min-w-0 flex-col overflow-hidden rounded-lg bg-white shadow-xl sm:max-w-5xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex min-w-0 shrink-0 items-start justify-between gap-4 border-b border-border p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">
              Edit stitch
            </p>
            <h2
              id="stitch-edit-dialog-title"
              className="mt-1 truncate text-xl font-bold text-text-primary"
            >
              {stitch.name}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              size="sm"
              icon={<Save aria-hidden className="h-4 w-4" />}
              isLoading={isSavingAny}
              disabled={!canSaveChanges}
              onClick={() => void handleSaveChanges()}
            >
              Save changes
            </Button>
            <IconButton
              type="button"
              label="Close stitch editor"
              icon={<X aria-hidden className="h-4 w-4" />}
              onClick={onClose}
            />
          </div>
        </div>
        <div className="grid min-h-0 min-w-0 max-w-full gap-4 overflow-x-hidden overflow-y-auto p-4 sm:gap-5 sm:p-5 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-4">
            <StitchSequencePreview
              demoClip={selectedPreviewSources?.demoClip ?? null}
              isLoading={isLoadingPreview}
              posterUrl={posterUrl}
              stitch={draftStitch}
              ugcClip={selectedPreviewSources?.ugcClip ?? null}
              onLoadPreview={() =>
                onLoadPreview(selectedUgcClipId, selectedDemoClipId)
              }
              onTextOverlayChange={setTextOverlays}
            />
            {selectedPreviewError ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {selectedPreviewError}
              </p>
            ) : null}
            {canEditSourceCrop ? (
              <div className="grid gap-3 rounded-lg border border-border p-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={isUgcCropOpen ? "primary" : "secondary"}
                    icon={<Crop aria-hidden className="h-4 w-4" />}
                    onClick={() => {
                      setIsUgcCropOpen((isOpen) => !isOpen);
                      if (!selectedPreviewSources) {
                        onLoadPreview(selectedUgcClipId, selectedDemoClipId);
                      }
                    }}
                  >
                    Crop Hook/UGC
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={isDemoCropOpen ? "primary" : "secondary"}
                    icon={<Crop aria-hidden className="h-4 w-4" />}
                    onClick={() => {
                      setIsDemoCropOpen((isOpen) => !isOpen);
                      if (!selectedPreviewSources) {
                        onLoadPreview(selectedUgcClipId, selectedDemoClipId);
                      }
                    }}
                  >
                    Crop demo
                  </Button>
                </div>
                {isUgcCropOpen ? (
                  <VideoCropEditor
                    crop={ugcCrop}
                    label="Crop Hook/UGC source"
                    mediaSrc={ugcCropVideoUrl}
                    posterSrc={posterUrl}
                    onChange={setUgcCrop}
                    onReset={() =>
                      setUgcCrop({
                        mode: "smart-9x16",
                        positionX: 0,
                        positionY: 0,
                        scale: 1,
                      })
                    }
                  />
                ) : null}
                {isDemoCropOpen ? (
                  <VideoCropEditor
                    crop={demoCrop}
                    label="Crop demo source"
                    mediaSrc={demoCropVideoUrl}
                    posterSrc={posterUrl}
                    onChange={setDemoCrop}
                    onReset={() =>
                      setDemoCrop({
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
                <Badge>STITCH</Badge>
                <span className="text-xs font-semibold text-text-tertiary">
                  {formatDuration(draftStitch.duration)}
                </span>
              </div>
              <p className="mt-3 break-words text-sm font-semibold text-text-primary [overflow-wrap:anywhere]">
                {draftStitch.ugcClipName} to {draftStitch.demoClipName}
              </p>
              <p className="mt-2 break-words text-xs font-semibold text-text-tertiary [overflow-wrap:anywhere]">
                Hook/UGC {getStitchTrimRangeLabel(draftStitch.ugcTrimRange)} . Demo{" "}
                {getStitchTrimRangeLabel(draftStitch.demoTrimRange)}
              </p>
              <p className="mt-2 break-words text-xs text-text-tertiary [overflow-wrap:anywhere]">
                {stitch.width} x {stitch.height} . {fileSizeLabel}
              </p>
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            {!isLongrStitch ? (
              <StitchSourceSettingsPanel
                demoClips={demoClips}
                demoFallbackClip={currentDemoFallbackClip}
                demoPlaybackRate={demoPlaybackRate}
                demoRemoveRanges={normalizedDemoRemoveRanges}
                demoTrimDuration={selectedDemoClip?.duration ?? 0}
                demoTrimRange={clampedDemoTrimRange}
                error={sourceSettingsError}
                selectedDemoClipId={selectedDemoClipId}
                selectedUgcClipId={selectedUgcClipId}
                totalDuration={draftStitch.duration}
                ugcClips={ugcClips}
                ugcFallbackClip={currentUgcFallbackClip}
                ugcPlaybackRate={ugcPlaybackRate}
                ugcRemoveRanges={normalizedUgcRemoveRanges}
                ugcTrimDuration={selectedUgcClip?.duration ?? 0}
                ugcTrimRange={clampedUgcTrimRange}
                onDemoClipChange={handleSelectDemoClip}
                onDemoPlaybackRateChange={setDemoPlaybackRate}
                onDemoRemoveRangesChange={setDemoRemoveRanges}
                onDemoTrimChange={setDemoTrimRange}
                onUgcClipChange={handleSelectUgcClip}
                onUgcPlaybackRateChange={setUgcPlaybackRate}
                onUgcRemoveRangesChange={setUgcRemoveRanges}
                onUgcTrimChange={setUgcTrimRange}
              />
            ) : null}
            <section className="min-w-0 overflow-hidden rounded-lg border border-border p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-text-primary">Text</h3>
              </div>
              {textError ? (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {textError}
                </div>
              ) : null}
              <TextOverlayEditor
                textOverlays={textOverlays}
                totalDuration={draftStitch.duration}
                ugcDuration={ugcDuration}
                currentTime={0}
                activeTextOverlayId={activeTextOverlayId}
                onActiveTextOverlayIdChange={setActiveTextOverlayId}
                onChange={setTextOverlays}
              />
            </section>
            <section className="min-w-0 overflow-hidden rounded-lg border border-border p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-text-primary">
                  Caption
                </h3>
              </div>
              {socialCaptionError ? (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {socialCaptionError}
                </div>
              ) : null}
              <StitchSocialCaptionField
                copyMessage={copyMessage}
                socialCaption={socialCaption}
                onChange={(nextSocialCaption) => {
                  setCopyMessage(null);
                  setSocialCaption(nextSocialCaption);
                }}
                onCopyError={() => setCopyMessage("Could not copy that caption.")}
                onCopySuccess={() => setCopyMessage("Copied.")}
              />
            </section>
            <section className="min-w-0 overflow-hidden rounded-lg border border-border p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-text-primary">Music</h3>
                <div className="flex flex-wrap justify-end gap-2">
                  <MusicSelectorButton
                    source="stitchr"
                    selectedTrackId={music?.sharedTrackId}
                    onSelectTrack={handleSelectTrack}
                  />
                </div>
              </div>
              {musicError ? (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {musicError}
                </div>
              ) : null}
              {music ? (
                <div className="grid gap-3">
                  <label className="flex items-start gap-3 rounded-lg border border-border bg-surface-elevated p-3">
                    <input
                      type="checkbox"
                      checked={enabled}
                      className="mt-1 h-4 w-4 accent-accent"
                      onChange={(event) =>
                        setEnabled(event.currentTarget.checked)
                      }
                    />
                    <span className="text-sm leading-6 text-text-secondary">
                      Include music when exporting this stitch.
                    </span>
                  </label>
                  <label className="block rounded-lg border border-border bg-surface-elevated p-3">
                    <span className="text-sm font-semibold text-text-primary">
                      Music volume
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(volume * 100)}
                      className="mt-3 w-full accent-accent"
                      onChange={(event) =>
                        setVolume(Number(event.currentTarget.value) / 100)
                      }
                    />
                    <span className="mt-1 block text-xs font-semibold text-text-tertiary">
                      {Math.round(volume * 100)}%
                    </span>
                  </label>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      variant="danger"
                      onClick={handleRemoveMusic}
                    >
                      Remove music
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-slate-50 p-4 text-sm font-semibold text-text-tertiary">
                  No music is attached to this stitch.
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
