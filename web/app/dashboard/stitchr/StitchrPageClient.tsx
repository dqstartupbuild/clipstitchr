"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DashboardAlert } from "@/app/_components/dashboard/DashboardAlert";
import { ClipPickerPanel } from "@/app/_components/stitchr/ClipPickerPanel";
import { StitchrProgressPanel } from "@/app/_components/stitchr/StitchrProgressPanel";
import { StitchrEmptyState } from "@/app/_components/stitchr/StitchrEmptyState";
import { StitchrBatchPanel } from "@/app/_components/stitchr/StitchrBatchPanel";
import { StitchrHeader } from "@/app/_components/stitchr/StitchrHeader";
import { StitchrShell } from "@/app/_components/stitchr/StitchrShell";
import { DownloadStitchesPanel } from "@/app/_components/stitchr/DownloadStitchesPanel";
import { SequencePreviewPanel } from "@/app/_components/stitchr/SequencePreviewPanel";
import { StitchrAutoTextPanel } from "@/app/_components/stitchr/StitchrAutoTextPanel";
import { StitchrLongrTimelineStrip } from "@/app/_components/stitchr/StitchrLongrTimelineStrip";
import { StitchrSocialCaptionPanel } from "@/app/_components/stitchr/StitchrSocialCaptionPanel";
import { generateStitchrBatch } from "@/lib/clipstitchr/client/generateStitchrBatch";
import { STITCHR_BATCH_OUTPUT_COUNT } from "@/lib/clipstitchr/constants/stitchrBatchGenerationLimits";
import { maxStitchrUgcSelectionCount } from "@/lib/clipstitchr/constants/maxStitchrUgcSelectionCount";
import { generateCliprText } from "@/lib/clipstitchr/client/generateCliprText";
import { defaultAutomationStitchrColorChoice } from "@/lib/clipstitchr/constants/defaultAutomationStitchrColorChoice";
import { defaultAutomationStitchrTextStyleChoice } from "@/lib/clipstitchr/constants/defaultAutomationStitchrTextStyleChoice";
import { useClipLibrary } from "@/lib/clipstitchr/hooks/useClipLibrary";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import { useLoadedVideoClip } from "@/lib/clipstitchr/hooks/useLoadedVideoClip";
import { useStitchr } from "@/lib/clipstitchr/hooks/useStitchr";
import type { AutomationStitchrColorChoice } from "@/lib/clipstitchr/types/AutomationStitchrColorChoice";
import type { AutomationStitchrTextStyleChoice } from "@/lib/clipstitchr/types/AutomationStitchrTextStyleChoice";
import type { StitchrLongrSelection } from "@/lib/clipstitchr/types/StitchrLongrSelection";
import type { StitchrHookOption } from "@/lib/clipstitchr/types/StitchrHookOption";
import type { StitchrMode } from "@/lib/clipstitchr/types/StitchrMode";
import type { StitchrUgcSelection } from "@/lib/clipstitchr/types/StitchrUgcSelection";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampTextOverlays } from "@/lib/clipstitchr/utils/clampTextOverlays";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { cloneTextOverlays } from "@/lib/clipstitchr/utils/cloneTextOverlays";
import { createDefaultTextOverlay } from "@/lib/clipstitchr/utils/createDefaultTextOverlay";
import { createStitchrTextGenerationClipContext } from "@/lib/clipstitchr/utils/createStitchrTextGenerationClipContext";
import { filterClipsByDemoProductId } from "@/lib/clipstitchr/utils/filterClipsByDemoProductId";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
import { getInitialStitchrMode } from "@/lib/clipstitchr/utils/getInitialStitchrMode";
import { getNonEmptyTextOverlays } from "@/lib/clipstitchr/utils/getNonEmptyTextOverlays";
import { getQuickEditPlaybackDuration } from "@/lib/clipstitchr/utils/getQuickEditPlaybackDuration";
import { getSearchParamValue } from "@/lib/clipstitchr/utils/getSearchParamValue";
import { getStitchrSocialCaptionForUgcId } from "@/lib/clipstitchr/utils/getStitchrSocialCaptionForUgcId";
import { getStitchrTextOverlaysForUgcId } from "@/lib/clipstitchr/utils/getStitchrTextOverlaysForUgcId";
import { getStitchrNormalOutputPlans } from "@/lib/clipstitchr/utils/getStitchrNormalOutputPlans";
import { getStitchrNormalTextGenerationClips } from "@/lib/clipstitchr/utils/getStitchrNormalTextGenerationClips";
import { getTextOverlayList } from "@/lib/clipstitchr/utils/getTextOverlayList";
import { mergeVideoClipMetadataById } from "@/lib/clipstitchr/utils/mergeVideoClipMetadataById";
import { toggleStitchrUgcSelection } from "@/lib/clipstitchr/utils/toggleStitchrUgcSelection";
import { StickyPreviewColumn } from "@/app/_components/workflow/StickyPreviewColumn";
import { WorkflowLayout } from "@/app/_components/workflow/WorkflowLayout";
import { WorkflowStepList } from "@/app/_components/workflow/WorkflowStepList";
import { HookLabBriefHandoffNotice } from "@/app/_components/hooks/HookLabBriefHandoffNotice";
import { useHookLabCreativeBrief } from "@/lib/clipstitchr/hooks/useHookLabCreativeBrief";

export function StitchrPageClient() {
  const [briefId] = useState(() => getSearchParamValue("brief") ?? null);
  const handoff = useHookLabCreativeBrief(briefId, "stitchr");
  const appliedBriefId = useRef<string | null>(null);
  const library = useClipLibrary();
  const products = useDashboardProduct();
  const stitchrState = useStitchr({
    loadClip: library.loadClip,
    onCreated: library.refresh,
  });
  const [mode, setMode] = useState<StitchrMode>(getInitialStitchrMode);
  const [includeDemoAudio, setIncludeDemoAudio] = useState(false);
  const [includeUgcAudio, setIncludeUgcAudio] = useState(false);
  const [demoPlaybackRate, setDemoPlaybackRate] =
    useState<VideoPlaybackRate>(1);
  const [ugcPlaybackRate, setUgcPlaybackRate] = useState<VideoPlaybackRate>(1);
  const [selectedMusicTrack, setSelectedMusicTrack] =
    useState<SharedMusicTrack | null>(null);
  const [batchTextStyleChoice, setBatchTextStyleChoice] =
    useState<AutomationStitchrTextStyleChoice>(
      defaultAutomationStitchrTextStyleChoice,
    );
  const [batchTextColorChoice, setBatchTextColorChoice] =
    useState<AutomationStitchrColorChoice>(defaultAutomationStitchrColorChoice);
  const [batchTextBackgroundColorChoice, setBatchTextBackgroundColorChoice] =
    useState<AutomationStitchrColorChoice>(defaultAutomationStitchrColorChoice);
  const [batchTextStrokeColorChoice, setBatchTextStrokeColorChoice] =
    useState<AutomationStitchrColorChoice>(defaultAutomationStitchrColorChoice);
  const [textOverlaysByUgcId, setTextOverlaysByUgcId] = useState<
    Record<string, TextOverlay[]>
  >({});
  const [reusedTextOverlays, setReusedTextOverlays] = useState<
    TextOverlay[] | null
  >(null);
  const [longrTextOverlays, setLongrTextOverlays] = useState<TextOverlay[]>([]);
  const [socialCaptionByUgcId, setSocialCaptionByUgcId] = useState<
    Record<string, string>
  >({});
  const [reusedSocialCaption, setReusedSocialCaption] = useState<string | null>(
    null,
  );
  const [longrSocialCaption, setLongrSocialCaption] = useState("");
  const [demoProductFilterId, setDemoProductFilterId] = useState<
    string | undefined
  >();
  const [isGeneratingAutoText, setIsGeneratingAutoText] = useState(false);
  const [autoTextMessage, setAutoTextMessage] = useState<string | null>(null);
  const [autoTextHookOptions, setAutoTextHookOptions] = useState<{
    contextKey: string;
    options: StitchrHookOption[];
  } | null>(null);
  const [ugcTrimRangesByClipId, setUgcTrimRangesByClipId] = useState<
    Record<string, VideoTrimRange>
  >({});
  const [demoTrimRangesByClipId, setDemoTrimRangesByClipId] = useState<
    Record<string, VideoTrimRange>
  >({});
  const [loadedLongrClipsById, setLoadedLongrClipsById] = useState<
    Record<string, VideoClip>
  >({});
  const [reusedUgcClips, setReusedUgcClips] = useState<VideoClipMetadata[]>(
    [],
  );
  const [reusedDemoClips, setReusedDemoClips] = useState<
    VideoClipMetadata[]
  >([]);
  const loadClip = library.loadClip;
  const {
    clips: plainUgcClips,
    hasMoreItems: hasMorePlainUgcClips,
    isLoadingMoreItems: isLoadingMorePlainUgcClips,
    loadMoreItems: loadMorePlainUgcClips,
  } = library.videoGroups.ugc;
  const {
    clips: cliprClips,
    hasMoreItems: hasMoreCliprClips,
    isLoadingMoreItems: isLoadingMoreCliprClips,
    loadMoreItems: loadMoreCliprClips,
  } = library.videoGroups.clipr;
  const {
    clips: swaprClips,
    hasMoreItems: hasMoreSwaprClips,
    isLoadingMoreItems: isLoadingMoreSwaprClips,
    loadMoreItems: loadMoreSwaprClips,
  } = library.videoGroups.swapr;
  const {
    clips: libraryDemoClips,
    hasMoreItems: hasMoreDemoClips,
    isLoadingMoreItems: isLoadingMoreDemoClips,
    loadMoreItems: loadMoreDemoClips,
  } = library.videoGroups.demo;
  const loadStitch = library.loadStitch;
  const demoClips = useMemo(
    () => mergeVideoClipMetadataById([...reusedDemoClips, ...libraryDemoClips]),
    [libraryDemoClips, reusedDemoClips],
  );
  const ugcClips = useMemo(
    () => {
      const clipsById = new Map<string, VideoClipMetadata>();

      for (const clip of [
        ...reusedUgcClips,
        ...plainUgcClips,
        ...cliprClips,
        ...swaprClips,
      ]) {
        clipsById.set(clip.id, clip);
      }

      return [...clipsById.values()];
    },
    [cliprClips, plainUgcClips, swaprClips, reusedUgcClips],
  );
  const hasMoreStitchrClips =
    hasMorePlainUgcClips ||
    hasMoreCliprClips ||
    hasMoreSwaprClips ||
    hasMoreDemoClips;
  const isLoadingMoreStitchrClips =
    isLoadingMorePlainUgcClips ||
    isLoadingMoreCliprClips ||
    isLoadingMoreSwaprClips ||
    isLoadingMoreDemoClips;
  const activeProducts = useMemo(
    () => (products.activeProduct ? [products.activeProduct] : []),
    [products.activeProduct],
  );
  const productIds = useMemo(
    () => new Set(activeProducts.map((product) => product.id)),
    [activeProducts],
  );
  const defaultProductFilterId = products.activeProductId ?? "all";
  const activeDemoProductFilterId =
    demoProductFilterId === undefined
      ? defaultProductFilterId
      : demoProductFilterId === "all" || productIds.has(demoProductFilterId)
        ? demoProductFilterId
      : "all";
  const visibleDemoClips = useMemo(
    () => filterClipsByDemoProductId(demoClips, activeDemoProductFilterId),
    [activeDemoProductFilterId, demoClips],
  );
  const [selectedUgcIds, setSelectedUgcIds] = useState<string[]>(
    () => {
      const initialUgcId = getSearchParamValue("ugcId");

      return initialUgcId ? [initialUgcId] : [];
    },
  );
  const [activePreviewUgcId, setActivePreviewUgcId] = useState<
    string | undefined
  >(() => getSearchParamValue("ugcId"));
  const [selectedDemoId, setSelectedDemoId] = useState<
    string | null | undefined
  >(() => getSearchParamValue("demoId") ?? null);
  const [selectedDemoIds, setSelectedDemoIds] = useState<string[]>(() => {
    const initialDemoId = getSearchParamValue("demoId");

    return initialDemoId ? [initialDemoId] : [];
  });
  const [longrTimelineClipIds, setLongrTimelineClipIds] = useState<string[]>(
    () => {
      const initialUgcId = getSearchParamValue("ugcId");
      const initialDemoId = getSearchParamValue("demoId");

      return [initialUgcId, initialDemoId].filter(
        (id): id is string => Boolean(id),
      );
    },
  );
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [batchMessage, setBatchMessage] = useState<string | null>(null);
  const activeSelectedUgcIds = useMemo(() => {
    const validUgcIds = new Set(ugcClips.map((clip) => clip.id));

    return selectedUgcIds
      .filter((id) => validUgcIds.has(id))
      .slice(0, maxStitchrUgcSelectionCount);
  }, [selectedUgcIds, ugcClips]);
  const activeDemoId = selectedDemoId ?? null;
  const activeSelectedDemoIds = useMemo(() => {
    const validDemoIds = new Set(visibleDemoClips.map((clip) => clip.id));

    return selectedDemoIds.filter((id) => validDemoIds.has(id));
  }, [selectedDemoIds, visibleDemoClips]);
  const activeUgcId =
    activePreviewUgcId && activeSelectedUgcIds.includes(activePreviewUgcId)
      ? activePreviewUgcId
      : (activeSelectedUgcIds[0] ?? null);
  const selectedUgcMetadata = useMemo(
    () =>
      activeSelectedUgcIds
        .map((id) => ugcClips.find((clip) => clip.id === id))
        .filter((clip): clip is VideoClipMetadata => Boolean(clip)),
    [activeSelectedUgcIds, ugcClips],
  );
  const activeUgcMetadata =
    selectedUgcMetadata.find((clip) => clip.id === activeUgcId) ??
    selectedUgcMetadata[0] ??
    null;
  const selectedDemoMetadata =
    visibleDemoClips.find((clip) => clip.id === activeDemoId) ?? null;
  const activeNormalMetadata = activeUgcMetadata ?? selectedDemoMetadata;
  const clipsById = useMemo(() => {
    const map = new Map<string, VideoClipMetadata>();

    for (const clip of [...ugcClips, ...visibleDemoClips]) {
      map.set(clip.id, clip);
    }

    return map;
  }, [ugcClips, visibleDemoClips]);
  const selectedLongrMetadata = useMemo(
    () =>
      longrTimelineClipIds
        .map((id) => clipsById.get(id))
        .filter((clip): clip is VideoClipMetadata => Boolean(clip)),
    [clipsById, longrTimelineClipIds],
  );
  const { clip: selectedUgcClip } = useLoadedVideoClip({
    clipId: activeUgcMetadata?.id ?? null,
    loadClip,
  });
  const { clip: selectedDemoClip } = useLoadedVideoClip({
    clipId: selectedDemoMetadata?.id ?? null,
    loadClip,
  });
  const selectedUgcTrimRangesByClipId = useMemo(
    () =>
      selectedUgcMetadata.reduce<Record<string, VideoTrimRange>>(
        (trimRanges, clip) => ({
          ...trimRanges,
          [clip.id]: clampVideoTrimRange(
            ugcTrimRangesByClipId[clip.id] ?? getDefaultVideoTrimRange(clip),
            clip.duration,
          ),
        }),
        {},
      ),
    [selectedUgcMetadata, ugcTrimRangesByClipId],
  );
  const selectedDemoTrimRangesByClipId = useMemo(
    () =>
      activeSelectedDemoIds.reduce<Record<string, VideoTrimRange>>(
        (trimRanges, id) => {
          const clip = visibleDemoClips.find((demoClip) => demoClip.id === id);

          if (!clip) {
            return trimRanges;
          }

          return {
            ...trimRanges,
            [clip.id]: clampVideoTrimRange(
              demoTrimRangesByClipId[clip.id] ?? getDefaultVideoTrimRange(clip),
              clip.duration,
            ),
          };
        },
        {},
      ),
    [activeSelectedDemoIds, demoTrimRangesByClipId, visibleDemoClips],
  );
  const selectedUgcTrimRange = activeUgcMetadata
    ? (selectedUgcTrimRangesByClipId[activeUgcMetadata.id] ??
      clampVideoTrimRange(
        ugcTrimRangesByClipId[activeUgcMetadata.id] ??
          getDefaultVideoTrimRange(activeUgcMetadata),
        activeUgcMetadata.duration,
      ))
    : null;
  const selectedDemoTrimRange = selectedDemoMetadata
    ? clampVideoTrimRange(
        demoTrimRangesByClipId[selectedDemoMetadata.id] ??
          getDefaultVideoTrimRange(selectedDemoMetadata),
        selectedDemoMetadata.duration,
      )
    : null;
  const selectedUgcDuration = selectedUgcTrimRange
    ? getQuickEditPlaybackDuration(
        selectedUgcTrimRange,
        activeUgcMetadata?.duration ?? selectedUgcTrimRange.end,
        activeUgcMetadata?.quickEdit?.removeRanges,
        ugcPlaybackRate,
      )
    : 0;
  const selectedDemoDuration = selectedDemoTrimRange
    ? getQuickEditPlaybackDuration(
        selectedDemoTrimRange,
        selectedDemoMetadata?.duration ?? selectedDemoTrimRange.end,
        selectedDemoMetadata?.quickEdit?.removeRanges,
        demoPlaybackRate,
      )
    : 0;
  const selectedLongrDuration = useMemo(
    () =>
      selectedLongrMetadata.reduce((duration, clip) => {
        const trimRange =
          clip.clipType === "demo"
            ? (selectedDemoTrimRangesByClipId[clip.id] ??
              getDefaultVideoTrimRange(clip))
            : (selectedUgcTrimRangesByClipId[clip.id] ??
              getDefaultVideoTrimRange(clip));
        const playbackRate =
          clip.clipType === "demo" ? demoPlaybackRate : ugcPlaybackRate;

        return (
          duration +
          getQuickEditPlaybackDuration(
            trimRange,
            clip.duration,
            clip.quickEdit?.removeRanges,
            playbackRate,
          )
        );
      }, 0),
    [
      demoPlaybackRate,
      selectedDemoTrimRangesByClipId,
      selectedLongrMetadata,
      selectedUgcTrimRangesByClipId,
      ugcPlaybackRate,
    ],
  );
  const canStitch =
    mode === "batch"
      ? false
      : mode === "longr"
      ? selectedLongrMetadata.length > 0
      : getStitchrNormalOutputPlans(
          selectedUgcMetadata.map((clip) => clip.id),
          selectedDemoMetadata?.id ?? null,
        ).length > 0;
  const totalDuration =
    mode === "longr"
      ? selectedLongrDuration
      : selectedUgcDuration + selectedDemoDuration;
  const activeTextOverlays = useMemo(
    () =>
      activeNormalMetadata
        ? getStitchrTextOverlaysForUgcId({
            fallbackTextOverlays: reusedTextOverlays,
            textOverlaysByUgcId,
            ugcId: activeNormalMetadata.id,
          })
        : [],
    [activeNormalMetadata, reusedTextOverlays, textOverlaysByUgcId],
  );
  const previewTextOverlays =
    mode === "longr" ? longrTextOverlays : activeTextOverlays;
  const activeSocialCaption =
    mode === "longr"
      ? longrSocialCaption
      : activeNormalMetadata
        ? getStitchrSocialCaptionForUgcId({
            fallbackSocialCaption: reusedSocialCaption,
            socialCaptionByUgcId,
            ugcId: activeNormalMetadata.id,
          })
        : "";
  const clampedTextOverlays = clampTextOverlays(
    previewTextOverlays,
    totalDuration,
  );
  const activeAutoTextProductId =
    products.activeProductId ?? "";
  const autoTextContextKey =
    mode === "longr"
      ? `longr:${selectedLongrMetadata.map((clip) => clip.id).join(",")}`
      : `normal:${activeNormalMetadata?.id ?? ""}:${selectedDemoMetadata?.id ?? ""}`;
  const activeAutoTextHookOptions =
    autoTextHookOptions?.contextKey === autoTextContextKey
      ? autoTextHookOptions.options
      : [];

  useEffect(() => {
    const brief = handoff.brief;

    if (!brief || appliedBriefId.current === brief.id) {
      return;
    }

    appliedBriefId.current = brief.id;
    setMode("normal");
    setReusedTextOverlays([
      {
        ...createDefaultTextOverlay(3, 0),
        text: brief.brief.soundOffOverlay,
      },
    ]);
    setAutoTextMessage(
      `Loaded ${brief.brief.directionName}. Choose Hook/UGC and Demo clips that fit the shot plan.`,
    );

    const product = products.products.find(
      (item) => item.id === brief.productId,
    );

    if (product && products.activeProductId !== product.id) {
      void products.setActiveProduct(product);
    }

    if (brief.status === "approved") {
      void handoff.markUsed();
    }
  }, [handoff, products]);
  const applyReusedStitch = useCallback(
    async (reuseStitchId: string) => {
      const reusedStitch = await loadStitch(reuseStitchId);

      if (!reusedStitch) {
        setAutoTextMessage("Unable to load that saved setup.");
        return;
      }

      const sourceIds = [
        ...new Set(
          reusedStitch.sequenceSegments?.length
            ? reusedStitch.sequenceSegments.map((segment) => segment.clipId)
            : [reusedStitch.ugcClipId, reusedStitch.demoClipId],
        ),
      ];
      const loadedSourceClips = (
        await Promise.all(sourceIds.map((id) => loadClip(id)))
      ).filter((clip): clip is VideoClip => Boolean(clip));
      const loadedUgcClips = loadedSourceClips.filter(
        (clip) => clip.clipType !== "demo",
      );
      const loadedDemoClips = loadedSourceClips.filter(
        (clip) => clip.clipType === "demo",
      );
      const savedTextOverlays = getTextOverlayList(
        reusedStitch.textOverlays,
        reusedStitch.textOverlay,
      );

      setReusedUgcClips((currentClips) =>
        mergeVideoClipMetadataById([...loadedUgcClips, ...currentClips]),
      );
      setReusedDemoClips((currentClips) =>
        mergeVideoClipMetadataById([...loadedDemoClips, ...currentClips]),
      );
      setLoadedLongrClipsById((currentClips) => {
        const nextClips = { ...currentClips };

        for (const clip of loadedSourceClips) {
          nextClips[clip.id] = clip;
        }

        return nextClips;
      });
      setSelectedMusicTrack(null);
      setIncludeDemoAudio(reusedStitch.includeDemoAudio ?? false);
      setIncludeUgcAudio(reusedStitch.includeUgcAudio ?? false);
      setDemoPlaybackRate(reusedStitch.demoPlaybackRate ?? 1);
      setUgcPlaybackRate(reusedStitch.ugcPlaybackRate ?? 1);
      setDemoProductFilterId("all");

      if (
        reusedStitch.mode === "longr" &&
        reusedStitch.sequenceSegments?.length
      ) {
        const orderedSegments = [...reusedStitch.sequenceSegments].sort(
          (left, right) => left.order - right.order,
        );
        const ugcIds = orderedSegments
          .filter((segment) => segment.clipType !== "demo")
          .map((segment) => segment.clipId);
        const demoIds = orderedSegments
          .filter((segment) => segment.clipType === "demo")
          .map((segment) => segment.clipId);
        const ugcTrimRanges = orderedSegments
          .filter((segment) => segment.clipType !== "demo")
          .reduce<Record<string, VideoTrimRange>>(
            (trimRanges, segment) => ({
              ...trimRanges,
              [segment.clipId]: segment.trimRange,
            }),
            {},
          );
        const demoTrimRanges = orderedSegments
          .filter((segment) => segment.clipType === "demo")
          .reduce<Record<string, VideoTrimRange>>(
            (trimRanges, segment) => ({
              ...trimRanges,
              [segment.clipId]: segment.trimRange,
            }),
            {},
          );
        const firstUgcPlaybackRate = orderedSegments.find(
          (segment) => segment.clipType !== "demo" && segment.playbackRate,
        )?.playbackRate;
        const firstDemoPlaybackRate = orderedSegments.find(
          (segment) => segment.clipType === "demo" && segment.playbackRate,
        )?.playbackRate;

        setMode("longr");
        setSelectedUgcIds(ugcIds.slice(0, maxStitchrUgcSelectionCount));
        setActivePreviewUgcId(ugcIds[0]);
        setSelectedDemoId(demoIds[0] ?? null);
        setSelectedDemoIds(demoIds);
        setLongrTimelineClipIds(
          orderedSegments.map((segment) => segment.clipId),
        );
        setUgcTrimRangesByClipId((trimRanges) => ({
          ...trimRanges,
          ...ugcTrimRanges,
        }));
        setDemoTrimRangesByClipId((trimRanges) => ({
          ...trimRanges,
          ...demoTrimRanges,
        }));
        setUgcPlaybackRate(
          firstUgcPlaybackRate ?? reusedStitch.ugcPlaybackRate ?? 1,
        );
        setDemoPlaybackRate(
          firstDemoPlaybackRate ?? reusedStitch.demoPlaybackRate ?? 1,
        );
        setTextOverlaysByUgcId({});
        setReusedTextOverlays(null);
        setLongrTextOverlays(cloneTextOverlays(savedTextOverlays));
        setSocialCaptionByUgcId({});
        setReusedSocialCaption(null);
        setLongrSocialCaption(reusedStitch.socialCaption ?? "");
        return;
      }

      if (reusedStitch.sequenceSegments?.length) {
        const segment = reusedStitch.sequenceSegments[0];

        setMode("normal");
        setSelectedUgcIds(segment.clipType === "demo" ? [] : [segment.clipId]);
        setActivePreviewUgcId(
          segment.clipType === "demo" ? undefined : segment.clipId,
        );
        setSelectedDemoId(segment.clipType === "demo" ? segment.clipId : null);
        setSelectedDemoIds(segment.clipType === "demo" ? [segment.clipId] : []);
        setLongrTimelineClipIds([segment.clipId]);
        if (segment.clipType === "demo") {
          setDemoTrimRangesByClipId((trimRanges) => ({
            ...trimRanges,
            [segment.clipId]: segment.trimRange,
          }));
        } else {
          setUgcTrimRangesByClipId((trimRanges) => ({
            ...trimRanges,
            [segment.clipId]: segment.trimRange,
          }));
        }
        setTextOverlaysByUgcId({});
        setReusedTextOverlays(cloneTextOverlays(savedTextOverlays));
        setLongrTextOverlays([]);
        setSocialCaptionByUgcId({});
        setReusedSocialCaption(reusedStitch.socialCaption ?? null);
        setLongrSocialCaption("");
        return;
      }

      setMode("normal");
      setSelectedUgcIds([reusedStitch.ugcClipId]);
      setActivePreviewUgcId(reusedStitch.ugcClipId);
      setSelectedDemoId(reusedStitch.demoClipId);
      setSelectedDemoIds([reusedStitch.demoClipId]);
      setLongrTimelineClipIds([
        reusedStitch.ugcClipId,
        reusedStitch.demoClipId,
      ]);
      setUgcTrimRangesByClipId((trimRanges) => ({
        ...trimRanges,
        ...(reusedStitch.ugcTrimRange
          ? { [reusedStitch.ugcClipId]: reusedStitch.ugcTrimRange }
          : {}),
      }));
      setDemoTrimRangesByClipId((trimRanges) => ({
        ...trimRanges,
        ...(reusedStitch.demoTrimRange
          ? { [reusedStitch.demoClipId]: reusedStitch.demoTrimRange }
          : {}),
      }));
      setTextOverlaysByUgcId({});
      setReusedTextOverlays(cloneTextOverlays(savedTextOverlays));
      setLongrTextOverlays([]);
      setSocialCaptionByUgcId({});
      setReusedSocialCaption(reusedStitch.socialCaption ?? null);
      setLongrSocialCaption("");
    },
    [loadClip, loadStitch],
  );
  const applyReusedStitchRef = useRef(applyReusedStitch);

  useEffect(() => {
    const syncSelectionFromUrl = () => {
      const reuseStitchId = getSearchParamValue("reuseStitchId");
      const initialUgcId = getSearchParamValue("ugcId");
      const initialDemoId = getSearchParamValue("demoId");

      if (reuseStitchId) {
        setMode("normal");
        void applyReusedStitchRef.current(reuseStitchId);
        return;
      }

      setReusedTextOverlays(null);
      setReusedSocialCaption(null);

      if (!initialUgcId && !initialDemoId) {
        return;
      }

      setMode("normal");

      if (initialUgcId) {
        setSelectedUgcIds([initialUgcId]);
        setActivePreviewUgcId(initialUgcId);
      }

      if (initialDemoId) {
        setSelectedDemoId(initialDemoId);
        setSelectedDemoIds([initialDemoId]);
      }
    };

    syncSelectionFromUrl();
    window.addEventListener("popstate", syncSelectionFromUrl);

    return () => {
      window.removeEventListener("popstate", syncSelectionFromUrl);
    };
  }, []);

  useEffect(() => {
    applyReusedStitchRef.current = applyReusedStitch;
  }, [applyReusedStitch]);

  useEffect(() => {
    if (mode !== "longr" || !selectedLongrMetadata.length) {
      return;
    }

    const missingClips = selectedLongrMetadata.filter(
      (clip) => !loadedLongrClipsById[clip.id],
    );

    if (!missingClips.length) {
      return;
    }

    let isCanceled = false;

    void Promise.all(
      missingClips.map(async (clip) => await loadClip(clip.id)),
    ).then((clips) => {
      if (isCanceled) {
        return;
      }

      setLoadedLongrClipsById((currentClips) => {
        const nextClips = { ...currentClips };

        clips.forEach((clip) => {
          if (clip) {
            nextClips[clip.id] = clip;
          }
        });

        return nextClips;
      });
    });

    return () => {
      isCanceled = true;
    };
  }, [loadClip, loadedLongrClipsById, mode, selectedLongrMetadata]);

  const handleSelectUgc = useCallback(
    (id: string) => {
      const clip = ugcClips.find((ugcClip) => ugcClip.id === id);
      const isCurrentlySelected = activeSelectedUgcIds.includes(id);
      const canSelectUgc =
        isCurrentlySelected ||
        activeSelectedUgcIds.length < maxStitchrUgcSelectionCount;

      setSelectedUgcIds((currentIds) => {
        return toggleStitchrUgcSelection(currentIds, id);
      });

      if (!clip) {
        return;
      }

      if (mode === "longr") {
        setLongrTimelineClipIds((currentIds) =>
          isCurrentlySelected
            ? currentIds.filter((currentId) => currentId !== id)
            : !canSelectUgc || currentIds.includes(id)
              ? currentIds
              : [...currentIds, id],
        );
      }

      if (
        !isCurrentlySelected &&
        activeSelectedUgcIds.length < maxStitchrUgcSelectionCount
      ) {
        setActivePreviewUgcId(id);
      } else if (isCurrentlySelected && activeUgcId === id) {
        setActivePreviewUgcId(undefined);
      }

      setUgcTrimRangesByClipId((trimRanges) =>
        trimRanges[id]
          ? trimRanges
          : {
              ...trimRanges,
              [id]: getDefaultVideoTrimRange(clip),
          },
      );

      if (
        mode !== "longr" &&
        !isCurrentlySelected &&
        canSelectUgc &&
        reusedTextOverlays !== null
      ) {
        const ugcTrimRange =
          ugcTrimRangesByClipId[id] ?? getDefaultVideoTrimRange(clip);
        const clipDuration =
          getQuickEditPlaybackDuration(
            ugcTrimRange,
            clip.duration,
            clip.quickEdit?.removeRanges,
            ugcPlaybackRate,
          ) +
          selectedDemoDuration;

        setTextOverlaysByUgcId((overlays) => {
          if (Object.prototype.hasOwnProperty.call(overlays, id)) {
            return overlays;
          }

          return {
            ...overlays,
            [id]: clampTextOverlays(
              cloneTextOverlays(reusedTextOverlays),
              clipDuration,
            ),
          };
        });
      }
    },
    [
      activeSelectedUgcIds,
      activeUgcId,
      mode,
      reusedTextOverlays,
      selectedDemoDuration,
      ugcClips,
      ugcPlaybackRate,
      ugcTrimRangesByClipId,
    ],
  );

  const handleSelectDemo = useCallback(
    (id: string) => {
      const clip = visibleDemoClips.find((demoClip) => demoClip.id === id);

      if (mode === "longr") {
        const isCurrentlySelected = activeSelectedDemoIds.includes(id);

        setSelectedDemoIds((currentIds) =>
          isCurrentlySelected
            ? currentIds.filter((currentId) => currentId !== id)
            : [...currentIds, id],
        );
        setLongrTimelineClipIds((currentIds) =>
          isCurrentlySelected
            ? currentIds.filter((currentId) => currentId !== id)
            : currentIds.includes(id)
              ? currentIds
              : [...currentIds, id],
        );

        if (clip) {
          setDemoTrimRangesByClipId((trimRanges) =>
            trimRanges[id]
              ? trimRanges
              : {
                  ...trimRanges,
                  [id]: getDefaultVideoTrimRange(clip),
                },
          );
        }

        return;
      }

      setSelectedDemoId((currentId) => {
        const currentActiveId = currentId ?? null;

        return currentActiveId === id ? null : id;
      });

      if (!clip) {
        return;
      }

      setDemoTrimRangesByClipId((trimRanges) =>
        trimRanges[id]
          ? trimRanges
          : {
              ...trimRanges,
              [id]: getDefaultVideoTrimRange(clip),
            },
      );
    },
    [activeSelectedDemoIds, mode, visibleDemoClips],
  );

  const handleUpdateUgcTrim = useCallback(
    (clip: VideoClipMetadata, trimRange: VideoTrimRange) => {
      setUgcTrimRangesByClipId((trimRanges) => ({
        ...trimRanges,
        [clip.id]: clampVideoTrimRange(trimRange, clip.duration),
      }));
    },
    [],
  );

  const handleUpdateDemoTrim = useCallback(
    (clip: VideoClipMetadata, trimRange: VideoTrimRange) => {
      setDemoTrimRangesByClipId((trimRanges) => ({
        ...trimRanges,
        [clip.id]: clampVideoTrimRange(trimRange, clip.duration),
      }));
    },
    [],
  );

  const handleTextOverlaysChange = useCallback(
    (nextTextOverlays: TextOverlay[]) => {
      const nextClampedTextOverlays = clampTextOverlays(
        nextTextOverlays,
        totalDuration,
      );

      if (mode === "longr") {
        setLongrTextOverlays(nextClampedTextOverlays);
        return;
      }

      if (!activeNormalMetadata) {
        return;
      }

      if (
        reusedTextOverlays !== null &&
        !Object.prototype.hasOwnProperty.call(
          textOverlaysByUgcId,
          activeNormalMetadata.id,
        )
      ) {
        setReusedTextOverlays(nextClampedTextOverlays);
        return;
      }

      setTextOverlaysByUgcId((overlays) => ({
        ...overlays,
        [activeNormalMetadata.id]: nextClampedTextOverlays,
      }));
    },
    [
      activeNormalMetadata,
      mode,
      reusedTextOverlays,
      textOverlaysByUgcId,
      totalDuration,
    ],
  );

  const handleCopyTextOverlayToAll = useCallback(() => {
    if (!activeUgcMetadata) {
      return;
    }

    const sourceTextOverlays = activeTextOverlays;

    if (reusedTextOverlays !== null) {
      setReusedTextOverlays(cloneTextOverlays(sourceTextOverlays));
    }
    setTextOverlaysByUgcId((overlays) =>
      selectedUgcMetadata.reduce<Record<string, TextOverlay[]>>(
        (nextOverlays, clip) => {
          const ugcTrimRange =
            selectedUgcTrimRangesByClipId[clip.id] ??
            getDefaultVideoTrimRange(clip);
          const clipDuration =
            getQuickEditPlaybackDuration(
              ugcTrimRange,
              clip.duration,
              clip.quickEdit?.removeRanges,
              ugcPlaybackRate,
            ) +
            selectedDemoDuration;

          return {
            ...nextOverlays,
            [clip.id]: clampTextOverlays(
              cloneTextOverlays(sourceTextOverlays),
              clipDuration,
            ),
          };
        },
        { ...overlays },
      ),
    );
  }, [
    activeUgcMetadata,
    activeTextOverlays,
    reusedTextOverlays,
    selectedDemoDuration,
    selectedUgcMetadata,
    selectedUgcTrimRangesByClipId,
    ugcPlaybackRate,
  ]);

  const handleSocialCaptionChange = useCallback(
    (nextSocialCaption: string) => {
      if (mode === "longr") {
        setLongrSocialCaption(nextSocialCaption);
        return;
      }

      if (!activeNormalMetadata) {
        return;
      }

      if (
        reusedSocialCaption !== null &&
        !Object.prototype.hasOwnProperty.call(
          socialCaptionByUgcId,
          activeNormalMetadata.id,
        )
      ) {
        setReusedSocialCaption(nextSocialCaption);
        return;
      }

      setSocialCaptionByUgcId((captions) => ({
        ...captions,
        [activeNormalMetadata.id]: nextSocialCaption,
      }));
    },
    [activeNormalMetadata, mode, reusedSocialCaption, socialCaptionByUgcId],
  );

  const handleStitch = () => {
    if (mode === "longr") {
      const selections: StitchrLongrSelection[] = selectedLongrMetadata.map(
        (clip) => {
          const trimRange =
            clip.clipType === "demo"
              ? (selectedDemoTrimRangesByClipId[clip.id] ??
                getDefaultVideoTrimRange(clip))
              : (selectedUgcTrimRangesByClipId[clip.id] ??
                getDefaultVideoTrimRange(clip));

          return {
            clip,
            playbackRate:
              clip.clipType === "demo" ? demoPlaybackRate : ugcPlaybackRate,
            trimRange,
          };
        },
      );
      const textOverlays = getNonEmptyTextOverlays(
        clampTextOverlays(longrTextOverlays, selectedLongrDuration),
      );

      void stitchrState.stitchLongrSequence(selections, textOverlays, {
        demoPlaybackRate,
        includeDemoAudio,
        includeUgcAudio,
        musicTrack: selectedMusicTrack,
        socialCaption: longrSocialCaption,
        ugcPlaybackRate,
      });
      return;
    }

    if (
      selectedDemoMetadata &&
      selectedDemoTrimRange &&
      selectedUgcMetadata.length
    ) {
      const ugcSelections: StitchrUgcSelection[] = selectedUgcMetadata.map(
        (clip) => {
          const trimRange =
            selectedUgcTrimRangesByClipId[clip.id] ??
            getDefaultVideoTrimRange(clip);
          const pairTextOverlays = getStitchrTextOverlaysForUgcId({
            fallbackTextOverlays: reusedTextOverlays,
            textOverlaysByUgcId,
            ugcId: clip.id,
          });
          const pairDuration =
            getQuickEditPlaybackDuration(
              trimRange,
              clip.duration,
              clip.quickEdit?.removeRanges,
              ugcPlaybackRate,
            ) +
            selectedDemoDuration;

          return {
            clip,
            socialCaption: getStitchrSocialCaptionForUgcId({
              fallbackSocialCaption: reusedSocialCaption,
              socialCaptionByUgcId,
              ugcId: clip.id,
            }),
            textOverlays: getNonEmptyTextOverlays(
              clampTextOverlays(pairTextOverlays, pairDuration),
            ),
            trimRange,
          };
        },
      );

      void stitchrState.stitchVideos(
        ugcSelections,
        selectedDemoMetadata,
        selectedDemoTrimRange,
        null,
        {
          demoPlaybackRate,
          includeDemoAudio,
          includeUgcAudio,
          musicTrack: selectedMusicTrack,
          ugcPlaybackRate,
        },
      );
      return;
    }

    const standaloneClips = selectedUgcMetadata.length
      ? selectedUgcMetadata
      : selectedDemoMetadata
        ? [selectedDemoMetadata]
        : [];
    const standaloneSelections = standaloneClips.map((clip) => {
      const isDemo = clip.clipType === "demo";
      const trimRange = isDemo
        ? (selectedDemoTrimRangesByClipId[clip.id] ??
          selectedDemoTrimRange ??
          getDefaultVideoTrimRange(clip))
        : (selectedUgcTrimRangesByClipId[clip.id] ??
          getDefaultVideoTrimRange(clip));
      const playbackRate = isDemo ? demoPlaybackRate : ugcPlaybackRate;
      const duration = getQuickEditPlaybackDuration(
        trimRange,
        clip.duration,
        clip.quickEdit?.removeRanges,
        playbackRate,
      );
      const textOverlays = getStitchrTextOverlaysForUgcId({
        fallbackTextOverlays: reusedTextOverlays,
        textOverlaysByUgcId,
        ugcId: clip.id,
      });

      return {
        clip,
        socialCaption: getStitchrSocialCaptionForUgcId({
          fallbackSocialCaption: reusedSocialCaption,
          socialCaptionByUgcId,
          ugcId: clip.id,
        }),
        textOverlays: getNonEmptyTextOverlays(
          clampTextOverlays(textOverlays, duration),
        ),
        trimRange,
      };
    });

    void stitchrState.stitchStandaloneVideos(standaloneSelections, {
      demoPlaybackRate,
      includeDemoAudio,
      includeUgcAudio,
      musicTrack: selectedMusicTrack,
      ugcPlaybackRate,
    });
  };

  const handleGenerateBatch = useCallback(() => {
    if (!products.activeProductId) {
      setBatchMessage("Choose a product before generating Stitch drafts.");
      return;
    }

    setIsGeneratingBatch(true);
    setBatchMessage(null);

    void generateStitchrBatch({
      productId: products.activeProductId,
      soundTrackId: selectedMusicTrack?.id,
      stitchrTextBackgroundColorChoice: batchTextBackgroundColorChoice,
      stitchrTextColorChoice: batchTextColorChoice,
      stitchrTextStrokeColorChoice: batchTextStrokeColorChoice,
      stitchrTextStyleChoice: batchTextStyleChoice,
    })
      .then((result) => {
        if (result.count > 0) {
          setBatchMessage(
            result.message ??
              `Queued ${result.count} Stitch drafts. ` +
                "They will show in your library when they are ready.",
          );
          return;
        }

        if (result.message) {
          setBatchMessage(result.message);
          return;
        }

        setBatchMessage("No Stitch drafts were queued.");
      })
      .catch((error) => {
        setBatchMessage(
          error instanceof Error
            ? error.message
            : "Unable to generate Stitch drafts.",
        );
      })
      .finally(() => setIsGeneratingBatch(false));
  }, [
    batchTextBackgroundColorChoice,
    batchTextColorChoice,
    batchTextStrokeColorChoice,
    batchTextStyleChoice,
    selectedMusicTrack?.id,
    products.activeProductId,
  ]);

  const handleGenerateAutoText = useCallback(() => {
    if (!activeAutoTextProductId) {
      setAutoTextMessage("Create or choose a product before generating text.");
      return;
    }

    if (!totalDuration) {
      setAutoTextMessage("Select clips before generating text.");
      return;
    }

    if (mode !== "longr" && !activeNormalMetadata) {
      setAutoTextMessage("Select a video before generating text.");
      return;
    }

    setIsGeneratingAutoText(true);
    setAutoTextMessage(null);

    const stitchrClipContexts =
      mode === "longr"
        ? selectedLongrMetadata.map(createStitchrTextGenerationClipContext)
        : getStitchrNormalTextGenerationClips(
            activeUgcMetadata,
            selectedDemoMetadata,
          ).map(createStitchrTextGenerationClipContext);

    void generateCliprText({
      durationSeconds: totalDuration > 30 ? 60 : 30,
      productId: activeAutoTextProductId,
      purpose: "stitchr",
      stitchrClipContexts,
      })
      .then((text) => {
        const generatedText = text.overlayText || text.hook;
        setAutoTextHookOptions({
          contextKey: autoTextContextKey,
          options: text.hookOptions ?? [],
        });
        const baseOverlay =
          previewTextOverlays[0] ?? createDefaultTextOverlay(totalDuration, 0);
        const nextTextOverlays = clampTextOverlays(
          [
            {
              ...baseOverlay,
              text: generatedText,
            },
            ...previewTextOverlays.slice(1),
          ],
          totalDuration,
        );

        if (mode === "longr") {
          setLongrTextOverlays(nextTextOverlays);
          setLongrSocialCaption(text.socialCaption || "");
          setAutoTextMessage("Hook options and caption generated.");
          return;
        }

        if (!activeNormalMetadata) {
          return;
        }

        if (
          reusedTextOverlays !== null &&
          !Object.prototype.hasOwnProperty.call(
            textOverlaysByUgcId,
            activeNormalMetadata.id,
          )
        ) {
          setReusedTextOverlays(nextTextOverlays);
          setReusedSocialCaption(text.socialCaption || "");
          setAutoTextMessage("Hook options and caption generated.");
          return;
        }

        setTextOverlaysByUgcId((overlays) => ({
          ...overlays,
          [activeNormalMetadata.id]: nextTextOverlays,
        }));
        setSocialCaptionByUgcId((captions) => ({
          ...captions,
          [activeNormalMetadata.id]: text.socialCaption || "",
        }));
        setAutoTextMessage("Hook options and caption generated.");
      })
      .catch((error) => {
        setAutoTextMessage(
          error instanceof Error ? error.message : "Unable to generate text.",
        );
      })
      .finally(() => setIsGeneratingAutoText(false));
  }, [
    activeAutoTextProductId,
    autoTextContextKey,
    activeNormalMetadata,
    activeUgcMetadata,
    mode,
    previewTextOverlays,
    reusedTextOverlays,
    selectedDemoMetadata,
    selectedLongrMetadata,
    textOverlaysByUgcId,
    totalDuration,
  ]);

  const handleHookOptionSelect = useCallback(
    (option: StitchrHookOption) => {
      const baseOverlay =
        previewTextOverlays[0] ?? createDefaultTextOverlay(totalDuration, 0);
      const nextTextOverlays = clampTextOverlays(
        [
          {
            ...baseOverlay,
            text: option.text,
          },
          ...previewTextOverlays.slice(1),
        ],
        totalDuration,
      );
      handleSocialCaptionChange(option.socialCaption);

      if (mode === "longr") {
        setLongrTextOverlays(nextTextOverlays);
        setAutoTextMessage("Hook updated.");
        return;
      }

      if (!activeNormalMetadata) {
        return;
      }

      if (
        reusedTextOverlays !== null &&
        !Object.prototype.hasOwnProperty.call(
          textOverlaysByUgcId,
          activeNormalMetadata.id,
        )
      ) {
        setReusedTextOverlays(nextTextOverlays);
        setAutoTextMessage("Hook updated.");
        return;
      }

      setTextOverlaysByUgcId((overlays) => ({
        ...overlays,
        [activeNormalMetadata.id]: nextTextOverlays,
      }));
      setAutoTextMessage("Hook updated.");
    },
    [
      activeNormalMetadata,
      handleSocialCaptionChange,
      mode,
      previewTextOverlays,
      reusedTextOverlays,
      textOverlaysByUgcId,
      totalDuration,
    ],
  );

  const handleActiveUgcChange = useCallback((id: string) => {
    setActivePreviewUgcId(id);
  }, []);
  const handleDemoProductFilterChange = useCallback((productId: string) => {
    setDemoProductFilterId(productId);
    setSelectedDemoId(null);
  }, []);
  const handleModeChange = useCallback(
    (nextMode: StitchrMode) => {
      setMode(nextMode);

      if (nextMode !== "longr") {
        return;
      }

      setSelectedDemoIds((currentIds) => {
        if (currentIds.length || !selectedDemoMetadata) {
          return currentIds;
        }

        return [selectedDemoMetadata.id];
      });
      setLongrTimelineClipIds((currentIds) => {
        if (currentIds.length) {
          return currentIds;
        }

        return [
          ...activeSelectedUgcIds,
          ...(selectedDemoMetadata ? [selectedDemoMetadata.id] : []),
        ];
      });
    },
    [activeSelectedUgcIds, selectedDemoMetadata],
  );
  const handleMoveLongrClip = useCallback(
    (draggedId: string, targetId: string) => {
      setLongrTimelineClipIds((currentIds) => {
        const draggedIndex = currentIds.indexOf(draggedId);
        const targetIndex = currentIds.indexOf(targetId);

        if (draggedIndex === -1 || targetIndex === -1) {
          return currentIds;
        }

        const nextIds = [...currentIds];
        const insertIndex =
          draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;

        nextIds.splice(draggedIndex, 1);
        nextIds.splice(insertIndex, 0, draggedId);
        return nextIds;
      });
    },
    [],
  );
  const handleRemoveLongrClip = useCallback(
    (id: string) => {
      const clip = clipsById.get(id);

      setLongrTimelineClipIds((currentIds) =>
        currentIds.filter((currentId) => currentId !== id),
      );

      if (clip?.clipType === "demo") {
        setSelectedDemoIds((currentIds) =>
          currentIds.filter((currentId) => currentId !== id),
        );
        return;
      }

      setSelectedUgcIds((currentIds) =>
        currentIds.filter((currentId) => currentId !== id),
      );
    },
    [clipsById],
  );
  const handleLoadMoreStitchrClips = useCallback(() => {
    if (hasMorePlainUgcClips) {
      loadMorePlainUgcClips();
    }

    if (hasMoreCliprClips) {
      loadMoreCliprClips();
    }

    if (hasMoreSwaprClips) {
      loadMoreSwaprClips();
    }

    if (hasMoreDemoClips) {
      loadMoreDemoClips();
    }
  }, [
    hasMoreCliprClips,
    hasMoreDemoClips,
    hasMorePlainUgcClips,
    hasMoreSwaprClips,
    loadMoreCliprClips,
    loadMoreDemoClips,
    loadMorePlainUgcClips,
    loadMoreSwaprClips,
  ]);

  const loadedLongrSequenceClips = selectedLongrMetadata
    .map((clip) => loadedLongrClipsById[clip.id])
    .filter((clip): clip is VideoClip => Boolean(clip));
  const longrSequenceTrimRanges = selectedLongrMetadata.map((clip) =>
    clip.clipType === "demo"
      ? (selectedDemoTrimRangesByClipId[clip.id] ??
        getDefaultVideoTrimRange(clip))
      : (selectedUgcTrimRangesByClipId[clip.id] ??
        getDefaultVideoTrimRange(clip)),
  );
  const longrSequencePlaybackRates = selectedLongrMetadata.map((clip) =>
    clip.clipType === "demo" ? demoPlaybackRate : ugcPlaybackRate,
  );
  const longrSequenceIncludeAudioFlags = selectedLongrMetadata.map((clip) =>
    clip.clipType === "demo" ? includeDemoAudio : includeUgcAudio,
  );
  const isStitching =
    stitchrState.status === "reading" ||
    stitchrState.status === "saving" ||
    stitchrState.status === "stitching";
  const hasStitchrInputs = ugcClips.length > 0 || demoClips.length > 0;
  const hasBatchInputs = ugcClips.length > 0 && demoClips.length > 0;
  const hasPickedStitchrClips =
    mode === "longr"
      ? selectedLongrMetadata.length > 0
      : canStitch;
  const hasFinishingDetails =
    getNonEmptyTextOverlays(clampedTextOverlays).length > 0 ||
    activeSocialCaption.trim().length > 0 ||
    Boolean(selectedMusicTrack);
  const hasCreatedStitches = stitchrState.stitches.length > 0;
  const stitchrWorkflowSteps = [
    {
      label: "Pick clips",
      description:
        mode === "longr"
          ? "Build the sequence."
          : "Choose one or more videos. Add a demo to pair it with UGC.",
      status: hasPickedStitchrClips ? "complete" : "current",
    },
    {
      label: "Add text",
      description: "Generate or edit overlay and post copy.",
      status: !hasPickedStitchrClips
        ? "upcoming"
        : hasFinishingDetails
          ? "complete"
          : "current",
    },
    {
      label: "Preview",
      description: "Check the exact output.",
      status: !hasPickedStitchrClips
        ? "upcoming"
        : hasCreatedStitches
          ? "complete"
          : hasFinishingDetails
            ? "current"
            : "upcoming",
    },
    {
      label: "Create",
      description: "Save and download the results.",
      status: hasCreatedStitches ? "complete" : "upcoming",
    },
  ] as const;

  return (
    <StitchrShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <StitchrHeader />
        {library.error ? (
          <DashboardAlert variant="error">{library.error}</DashboardAlert>
        ) : null}
        <HookLabBriefHandoffNotice
          brief={handoff.brief}
          isLoading={handoff.isLoading}
        />
        {hasBatchInputs && mode === "batch" ? (
          <StitchrBatchPanel
            backgroundColorChoice={batchTextBackgroundColorChoice}
            batchSize={STITCHR_BATCH_OUTPUT_COUNT}
            isDisabled={isGeneratingBatch}
            isGenerating={isGeneratingBatch}
            message={batchMessage}
            mode={mode}
            selectedSoundTrack={selectedMusicTrack}
            strokeColorChoice={batchTextStrokeColorChoice}
            textColorChoice={batchTextColorChoice}
            textStyleChoice={batchTextStyleChoice}
            onBackgroundColorChoiceChange={setBatchTextBackgroundColorChoice}
            onGenerate={handleGenerateBatch}
            onModeChange={handleModeChange}
            onSelectSoundTrack={(track) => {
              setSelectedMusicTrack(track);
            }}
            onStrokeColorChoiceChange={setBatchTextStrokeColorChoice}
            onTextColorChoiceChange={setBatchTextColorChoice}
            onTextStyleChoiceChange={setBatchTextStyleChoice}
          />
        ) : hasStitchrInputs && mode !== "batch" ? (
          <>
            <WorkflowStepList
              label="Stitchr workflow"
              steps={stitchrWorkflowSteps}
            />
            <WorkflowLayout
              aside={
                <StickyPreviewColumn>
                  <SequencePreviewPanel
                    mode={mode}
                    previewUgcClips={selectedUgcMetadata}
                    activeUgcId={activeUgcMetadata?.id ?? null}
                    ugcClip={selectedUgcClip}
                    demoClip={selectedDemoClip}
                    sequenceClips={loadedLongrSequenceClips}
                    sequenceIncludeAudioFlags={longrSequenceIncludeAudioFlags}
                    sequencePlaybackRates={longrSequencePlaybackRates}
                    sequenceTrimRanges={longrSequenceTrimRanges}
                    ugcTrimRange={selectedUgcTrimRange}
                    demoTrimRange={selectedDemoTrimRange}
                    demoPlaybackRate={demoPlaybackRate}
                    includeDemoAudio={includeDemoAudio}
                    includeUgcAudio={includeUgcAudio}
                    textOverlays={clampedTextOverlays}
                    ugcPlaybackRate={ugcPlaybackRate}
                    canCopyTextOverlayToAll={
                      mode === "normal" && selectedUgcMetadata.length > 1
                    }
                    onActiveUgcChange={handleActiveUgcChange}
                    onCopyTextOverlayToAll={handleCopyTextOverlayToAll}
                    onTextOverlaysChange={handleTextOverlaysChange}
                  />
                </StickyPreviewColumn>
              }
            >
            <div className="flex min-w-0 flex-col gap-5">
              <ClipPickerPanel
                mode={mode}
                demoPlaybackRate={demoPlaybackRate}
                includeDemoAudio={includeDemoAudio}
                includeUgcAudio={includeUgcAudio}
                hasMoreClips={hasMoreStitchrClips}
                isLoadingMoreClips={isLoadingMoreStitchrClips}
                selectedMusicTrack={selectedMusicTrack}
                products={activeProducts}
                ugcClips={ugcClips}
                demoClips={visibleDemoClips}
                demoProductFilterId={activeDemoProductFilterId}
                selectedUgcIds={activeSelectedUgcIds}
                selectedDemoId={selectedDemoMetadata?.id ?? null}
                selectedDemoIds={activeSelectedDemoIds}
                selectedLongrCount={selectedLongrMetadata.length}
                selectedUgcTrimRangesByClipId={selectedUgcTrimRangesByClipId}
                selectedDemoTrimRangesByClipId={
                  selectedDemoTrimRangesByClipId
                }
                selectedDemoTrimRange={selectedDemoTrimRange}
                ugcPlaybackRate={ugcPlaybackRate}
                onLoadClip={loadClip}
                onLoadPoster={library.loadClipPoster}
                onSelectUgc={handleSelectUgc}
                onSelectDemo={handleSelectDemo}
                onDemoProductFilterChange={handleDemoProductFilterChange}
                onModeChange={handleModeChange}
                onUpdateUgcTrim={handleUpdateUgcTrim}
                onUpdateDemoTrim={handleUpdateDemoTrim}
                onUpdateUgcCuts={library.updateClipCuts}
                onUpdateDemoCuts={library.updateClipCuts}
                canStitch={canStitch}
                isStitching={isStitching}
                onDemoPlaybackRateChange={setDemoPlaybackRate}
                onIncludeDemoAudioChange={setIncludeDemoAudio}
                onIncludeUgcAudioChange={setIncludeUgcAudio}
                onLoadMoreClips={handleLoadMoreStitchrClips}
                onSelectMusicTrack={(track) => {
                  setSelectedMusicTrack(track);
                }}
                onStitch={handleStitch}
                onUgcPlaybackRateChange={setUgcPlaybackRate}
              />
              {mode === "longr" ? (
                <StitchrLongrTimelineStrip
                  clips={selectedLongrMetadata}
                  onLoadPoster={library.loadClipPoster}
                  onMoveClip={handleMoveLongrClip}
                  onRemoveClip={handleRemoveLongrClip}
                />
              ) : null}
              <StitchrAutoTextPanel
                hookOptions={activeAutoTextHookOptions}
                products={activeProducts}
                selectedHookText={previewTextOverlays[0]?.text ?? ""}
                selectedProductId={activeAutoTextProductId}
                isGenerating={isGeneratingAutoText}
                message={autoTextMessage}
                onProductChange={() => undefined}
                onGenerate={handleGenerateAutoText}
                onHookOptionSelect={handleHookOptionSelect}
              />
              {mode === "longr" || activeNormalMetadata ? (
                <StitchrSocialCaptionPanel
                  socialCaption={activeSocialCaption}
                  onChange={handleSocialCaptionChange}
                />
              ) : null}
              <StitchrProgressPanel
                status={stitchrState.status}
                progress={stitchrState.progress}
                error={stitchrState.error}
                completedCount={stitchrState.completedCount}
                totalCount={stitchrState.totalCount}
              />
              <DownloadStitchesPanel
                stitches={stitchrState.stitches}
                onLoadClip={loadClip}
              />
            </div>
            </WorkflowLayout>
          </>
        ) : library.isLoading ? (
          <div className="rounded-lg border border-border bg-surface p-5 text-sm text-text-secondary">
            Loading Stitchr clips...
          </div>
        ) : (
          <StitchrEmptyState />
        )}
      </div>
    </StitchrShell>
  );
}
