"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipPickerPanel } from "@/app/_components/stitchr/ClipPickerPanel";
import { StitchrProgressPanel } from "@/app/_components/stitchr/StitchrProgressPanel";
import { StitchrEmptyState } from "@/app/_components/stitchr/StitchrEmptyState";
import { StitchrHeader } from "@/app/_components/stitchr/StitchrHeader";
import { StitchrShell } from "@/app/_components/stitchr/StitchrShell";
import { DownloadStitchesPanel } from "@/app/_components/stitchr/DownloadStitchesPanel";
import { SequencePreviewPanel } from "@/app/_components/stitchr/SequencePreviewPanel";
import { StitchrAutoTextPanel } from "@/app/_components/stitchr/StitchrAutoTextPanel";
import { StitchrLongrTimelineStrip } from "@/app/_components/stitchr/StitchrLongrTimelineStrip";
import { StitchTemplatePicker } from "@/app/_components/stitchr/StitchTemplatePicker";
import { maxStitchrUgcSelectionCount } from "@/lib/clipstitchr/constants/maxStitchrUgcSelectionCount";
import { generateCliprText } from "@/lib/clipstitchr/client/generateCliprText";
import { useClipLibrary } from "@/lib/clipstitchr/hooks/useClipLibrary";
import { useLoadedVideoClip } from "@/lib/clipstitchr/hooks/useLoadedVideoClip";
import { useProducts } from "@/lib/clipstitchr/hooks/useProducts";
import { useStitchTemplates } from "@/lib/clipstitchr/hooks/useStitchTemplates";
import { useStitchr } from "@/lib/clipstitchr/hooks/useStitchr";
import type { StitchrLongrSelection } from "@/lib/clipstitchr/types/StitchrLongrSelection";
import type { StitchrMode } from "@/lib/clipstitchr/types/StitchrMode";
import type { StitchrUgcSelection } from "@/lib/clipstitchr/types/StitchrUgcSelection";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { StitchTemplate } from "@/lib/clipstitchr/types/StitchTemplate";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clampTextOverlays } from "@/lib/clipstitchr/utils/clampTextOverlays";
import { clampVideoTrimRange } from "@/lib/clipstitchr/utils/clampVideoTrimRange";
import { cloneTextOverlays } from "@/lib/clipstitchr/utils/cloneTextOverlays";
import { createDefaultTextOverlay } from "@/lib/clipstitchr/utils/createDefaultTextOverlay";
import { filterClipsByDemoProductId } from "@/lib/clipstitchr/utils/filterClipsByDemoProductId";
import { getDefaultVideoTrimRange } from "@/lib/clipstitchr/utils/getDefaultVideoTrimRange";
import { getNonEmptyTextOverlays } from "@/lib/clipstitchr/utils/getNonEmptyTextOverlays";
import { getPlaybackRateDuration } from "@/lib/clipstitchr/utils/getPlaybackRateDuration";
import { getSearchParamValue } from "@/lib/clipstitchr/utils/getSearchParamValue";
import { getStitchrTextOverlaysForUgcId } from "@/lib/clipstitchr/utils/getStitchrTextOverlaysForUgcId";
import { getTextOverlayList } from "@/lib/clipstitchr/utils/getTextOverlayList";
import { mergeVideoClipMetadataById } from "@/lib/clipstitchr/utils/mergeVideoClipMetadataById";
import { toggleStitchrUgcSelection } from "@/lib/clipstitchr/utils/toggleStitchrUgcSelection";

export function StitchrPageClient() {
  const library = useClipLibrary();
  const products = useProducts();
  const stitchTemplates = useStitchTemplates();
  const stitchrState = useStitchr({
    loadClip: library.loadClip,
    onCreated: library.refresh,
  });
  const [addMusic, setAddMusic] = useState(false);
  const [mode, setMode] = useState<StitchrMode>("normal");
  const [includeDemoAudio, setIncludeDemoAudio] = useState(false);
  const [includeUgcAudio, setIncludeUgcAudio] = useState(false);
  const [demoPlaybackRate, setDemoPlaybackRate] =
    useState<VideoPlaybackRate>(1);
  const [ugcPlaybackRate, setUgcPlaybackRate] = useState<VideoPlaybackRate>(1);
  const [selectedMusicTrack, setSelectedMusicTrack] =
    useState<SharedMusicTrack | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    () => getSearchParamValue("templateId") ?? "",
  );
  const [appliedTemplateId, setAppliedTemplateId] = useState("");
  const [textOverlaysByUgcId, setTextOverlaysByUgcId] = useState<
    Record<string, TextOverlay[]>
  >({});
  const [reusedTextOverlays, setReusedTextOverlays] = useState<
    TextOverlay[] | null
  >(null);
  const [longrTextOverlays, setLongrTextOverlays] = useState<TextOverlay[]>([]);
  const [selectedAutoTextProductId, setSelectedAutoTextProductId] = useState("");
  const [demoProductFilterId, setDemoProductFilterId] = useState<
    string | undefined
  >();
  const [isGeneratingAutoText, setIsGeneratingAutoText] = useState(false);
  const [autoTextMessage, setAutoTextMessage] = useState<string | null>(null);
  const [ugcTrimRangesByClipId, setUgcTrimRangesByClipId] = useState<
    Record<string, VideoTrimRange>
  >({});
  const [demoTrimRangesByClipId, setDemoTrimRangesByClipId] = useState<
    Record<string, VideoTrimRange>
  >({});
  const [loadedLongrClipsById, setLoadedLongrClipsById] = useState<
    Record<string, VideoClip>
  >({});
  const [templateUgcClips, setTemplateUgcClips] = useState<VideoClipMetadata[]>(
    [],
  );
  const [templateDemoClips, setTemplateDemoClips] = useState<
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
  const demoClips = useMemo(
    () => mergeVideoClipMetadataById([...templateDemoClips, ...libraryDemoClips]),
    [libraryDemoClips, templateDemoClips],
  );
  const ugcClips = useMemo(
    () => {
      const clipsById = new Map<string, VideoClipMetadata>();

      for (const clip of [
        ...templateUgcClips,
        ...plainUgcClips,
        ...cliprClips,
        ...swaprClips,
      ]) {
        clipsById.set(clip.id, clip);
      }

      return [...clipsById.values()];
    },
    [cliprClips, plainUgcClips, swaprClips, templateUgcClips],
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
  const productIds = useMemo(
    () => new Set(products.products.map((product) => product.id)),
    [products.products],
  );
  const defaultProductFilterId = products.defaultProductId ?? "all";
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
  >(() => getSearchParamValue("demoId"));
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
  const activeSelectedUgcIds = useMemo(() => {
    const validUgcIds = new Set(ugcClips.map((clip) => clip.id));

    return selectedUgcIds
      .filter((id) => validUgcIds.has(id))
      .slice(0, maxStitchrUgcSelectionCount);
  }, [selectedUgcIds, ugcClips]);
  const activeDemoId =
    selectedDemoId === undefined
      ? (visibleDemoClips[0]?.id ?? null)
      : selectedDemoId;
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
    ? getPlaybackRateDuration(selectedUgcTrimRange, ugcPlaybackRate)
    : 0;
  const selectedDemoDuration = selectedDemoTrimRange
    ? getPlaybackRateDuration(selectedDemoTrimRange, demoPlaybackRate)
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

        return duration + getPlaybackRateDuration(trimRange, playbackRate);
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
    mode === "longr"
      ? selectedLongrMetadata.length > 0
      : Boolean(
          selectedUgcMetadata.length &&
            selectedDemoMetadata &&
            selectedUgcTrimRange &&
            selectedDemoTrimRange,
        );
  const totalDuration =
    mode === "longr"
      ? selectedLongrDuration
      : selectedUgcDuration + selectedDemoDuration;
  const activeTextOverlays = useMemo(
    () =>
      activeUgcMetadata
        ? getStitchrTextOverlaysForUgcId({
            fallbackTextOverlays: reusedTextOverlays,
            textOverlaysByUgcId,
            ugcId: activeUgcMetadata.id,
          })
        : [],
    [activeUgcMetadata, reusedTextOverlays, textOverlaysByUgcId],
  );
  const previewTextOverlays =
    mode === "longr" ? longrTextOverlays : activeTextOverlays;
  const clampedTextOverlays = clampTextOverlays(
    previewTextOverlays,
    totalDuration,
  );
  const activeAutoTextProductId =
    selectedAutoTextProductId ||
    products.defaultProductId ||
    products.products[0]?.id ||
    "";

  const applyTemplateStitch = useCallback(
    async (templateStitchId: string) => {
      const templateStitch = await library.loadStitch(templateStitchId);

      if (!templateStitch) {
        setAutoTextMessage("Unable to load that stitch template.");
        return;
      }

      const sourceIds = [
        ...new Set(
          templateStitch.mode === "longr" &&
            templateStitch.sequenceSegments?.length
            ? templateStitch.sequenceSegments.map((segment) => segment.clipId)
            : [templateStitch.ugcClipId, templateStitch.demoClipId],
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
      const templateTextOverlays = getTextOverlayList(
        templateStitch.textOverlays,
        templateStitch.textOverlay,
      );

      setTemplateUgcClips((currentClips) =>
        mergeVideoClipMetadataById([...loadedUgcClips, ...currentClips]),
      );
      setTemplateDemoClips((currentClips) =>
        mergeVideoClipMetadataById([...loadedDemoClips, ...currentClips]),
      );
      setLoadedLongrClipsById((currentClips) => {
        const nextClips = { ...currentClips };

        for (const clip of loadedSourceClips) {
          nextClips[clip.id] = clip;
        }

        return nextClips;
      });
      setAddMusic(false);
      setSelectedMusicTrack(null);
      setIncludeDemoAudio(templateStitch.includeDemoAudio ?? false);
      setIncludeUgcAudio(templateStitch.includeUgcAudio ?? false);
      setDemoPlaybackRate(templateStitch.demoPlaybackRate ?? 1);
      setUgcPlaybackRate(templateStitch.ugcPlaybackRate ?? 1);
      setDemoProductFilterId("all");

      if (
        templateStitch.mode === "longr" &&
        templateStitch.sequenceSegments?.length
      ) {
        const orderedSegments = [...templateStitch.sequenceSegments].sort(
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
          firstUgcPlaybackRate ?? templateStitch.ugcPlaybackRate ?? 1,
        );
        setDemoPlaybackRate(
          firstDemoPlaybackRate ?? templateStitch.demoPlaybackRate ?? 1,
        );
        setTextOverlaysByUgcId({});
        setReusedTextOverlays(null);
        setLongrTextOverlays(cloneTextOverlays(templateTextOverlays));
        return;
      }

      setMode("normal");
      setSelectedUgcIds([templateStitch.ugcClipId]);
      setActivePreviewUgcId(templateStitch.ugcClipId);
      setSelectedDemoId(templateStitch.demoClipId);
      setSelectedDemoIds([templateStitch.demoClipId]);
      setLongrTimelineClipIds([
        templateStitch.ugcClipId,
        templateStitch.demoClipId,
      ]);
      setUgcTrimRangesByClipId((trimRanges) => ({
        ...trimRanges,
        ...(templateStitch.ugcTrimRange
          ? { [templateStitch.ugcClipId]: templateStitch.ugcTrimRange }
          : {}),
      }));
      setDemoTrimRangesByClipId((trimRanges) => ({
        ...trimRanges,
        ...(templateStitch.demoTrimRange
          ? { [templateStitch.demoClipId]: templateStitch.demoTrimRange }
          : {}),
      }));
      setTextOverlaysByUgcId({});
      setReusedTextOverlays(cloneTextOverlays(templateTextOverlays));
      setLongrTextOverlays([]);
    },
    [library, loadClip],
  );
  const applyStitchTemplate = useCallback(
    async (template: StitchTemplate) => {
      const sourceIds = [
        ...new Set(
          template.mode === "longr" && template.sequenceSegments?.length
            ? template.sequenceSegments.map((segment) => segment.clipId)
            : [template.ugcClipId, template.demoClipId],
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
      const templateTextOverlays = getTextOverlayList(
        template.textOverlays,
        template.textOverlay,
      );

      if (loadedSourceClips.length !== sourceIds.length) {
        setAutoTextMessage("Some clips from that template are missing.");
      }

      setTemplateUgcClips((currentClips) =>
        mergeVideoClipMetadataById([...loadedUgcClips, ...currentClips]),
      );
      setTemplateDemoClips((currentClips) =>
        mergeVideoClipMetadataById([...loadedDemoClips, ...currentClips]),
      );
      setLoadedLongrClipsById((currentClips) => {
        const nextClips = { ...currentClips };

        for (const clip of loadedSourceClips) {
          nextClips[clip.id] = clip;
        }

        return nextClips;
      });
      setAddMusic(false);
      setSelectedMusicTrack(null);
      setIncludeDemoAudio(template.includeDemoAudio ?? false);
      setIncludeUgcAudio(template.includeUgcAudio ?? false);
      setDemoPlaybackRate(template.demoPlaybackRate ?? 1);
      setUgcPlaybackRate(template.ugcPlaybackRate ?? 1);
      setDemoProductFilterId("all");

      if (template.mode === "longr" && template.sequenceSegments?.length) {
        const orderedSegments = [...template.sequenceSegments].sort(
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
        setUgcPlaybackRate(firstUgcPlaybackRate ?? template.ugcPlaybackRate ?? 1);
        setDemoPlaybackRate(
          firstDemoPlaybackRate ?? template.demoPlaybackRate ?? 1,
        );
        setTextOverlaysByUgcId({});
        setReusedTextOverlays(null);
        setLongrTextOverlays(cloneTextOverlays(templateTextOverlays));
        return;
      }

      setMode("normal");
      setSelectedUgcIds([template.ugcClipId]);
      setActivePreviewUgcId(template.ugcClipId);
      setSelectedDemoId(template.demoClipId);
      setSelectedDemoIds([template.demoClipId]);
      setLongrTimelineClipIds([template.ugcClipId, template.demoClipId]);
      setUgcTrimRangesByClipId((trimRanges) => ({
        ...trimRanges,
        ...(template.ugcTrimRange
          ? { [template.ugcClipId]: template.ugcTrimRange }
          : {}),
      }));
      setDemoTrimRangesByClipId((trimRanges) => ({
        ...trimRanges,
        ...(template.demoTrimRange
          ? { [template.demoClipId]: template.demoTrimRange }
          : {}),
      }));
      setTextOverlaysByUgcId({});
      setReusedTextOverlays(cloneTextOverlays(templateTextOverlays));
      setLongrTextOverlays([]);
    },
    [loadClip],
  );

  useEffect(() => {
    const syncSelectionFromUrl = () => {
      const templateStitchId = getSearchParamValue("templateStitchId");
      const templateId = getSearchParamValue("templateId");
      const initialUgcId = getSearchParamValue("ugcId");
      const initialDemoId = getSearchParamValue("demoId");

      if (templateStitchId) {
        setSelectedTemplateId("");
        setAppliedTemplateId("");
        void applyTemplateStitch(templateStitchId);
        return;
      }

      if (templateId) {
        setSelectedTemplateId(templateId);
        setAppliedTemplateId("");
        return;
      }

      setSelectedTemplateId("");
      setAppliedTemplateId("");
      setReusedTextOverlays(null);

      if (!initialUgcId && !initialDemoId) {
        return;
      }

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
  }, [applyTemplateStitch]);

  useEffect(() => {
    if (
      !selectedTemplateId ||
      selectedTemplateId === appliedTemplateId ||
      stitchTemplates.isLoading
    ) {
      return;
    }

    const selectedTemplate = stitchTemplates.templates.find(
      (template) => template.id === selectedTemplateId,
    );

    if (!selectedTemplate) {
      void Promise.resolve().then(() => {
        setAutoTextMessage("Unable to find that template.");
        setAppliedTemplateId(selectedTemplateId);
      });
      return;
    }

    const applyTimeoutId = window.setTimeout(() => {
      void applyStitchTemplate(selectedTemplate).then(() => {
        setAppliedTemplateId(selectedTemplate.id);
      });
    }, 0);

    return () => {
      window.clearTimeout(applyTimeoutId);
    };
  }, [
    appliedTemplateId,
    applyStitchTemplate,
    selectedTemplateId,
    stitchTemplates.isLoading,
    stitchTemplates.templates,
  ]);

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
          getPlaybackRateDuration(ugcTrimRange, ugcPlaybackRate) +
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
        const currentActiveId =
          currentId === undefined
            ? (visibleDemoClips[0]?.id ?? null)
            : currentId;

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

      if (!activeUgcMetadata) {
        return;
      }

      if (
        reusedTextOverlays !== null &&
        !Object.prototype.hasOwnProperty.call(
          textOverlaysByUgcId,
          activeUgcMetadata.id,
        )
      ) {
        setReusedTextOverlays(nextClampedTextOverlays);
        return;
      }

      setTextOverlaysByUgcId((overlays) => ({
        ...overlays,
        [activeUgcMetadata.id]: nextClampedTextOverlays,
      }));
    },
    [
      activeUgcMetadata,
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
            getPlaybackRateDuration(ugcTrimRange, ugcPlaybackRate) +
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
        addMusic: addMusic && !selectedMusicTrack,
        demoPlaybackRate,
        includeDemoAudio,
        includeUgcAudio,
        musicTrack: selectedMusicTrack,
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
            getPlaybackRateDuration(trimRange, ugcPlaybackRate) +
            selectedDemoDuration;

          return {
            clip,
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
          addMusic: addMusic && !selectedMusicTrack,
          demoPlaybackRate,
          includeDemoAudio,
          includeUgcAudio,
          musicTrack: selectedMusicTrack,
          ugcPlaybackRate,
        },
      );
    }
  };

  const handleGenerateAutoText = useCallback(() => {
    if (!activeAutoTextProductId) {
      setAutoTextMessage("Choose a saved Settings product before generating text.");
      return;
    }

    if (!totalDuration) {
      setAutoTextMessage("Select clips before generating text.");
      return;
    }

    if (mode !== "longr" && !activeUgcMetadata) {
      setAutoTextMessage("Select UGC before generating text.");
      return;
    }

    setIsGeneratingAutoText(true);
    setAutoTextMessage(null);

    void generateCliprText({
      durationSeconds: totalDuration > 30 ? 60 : 30,
      productId: activeAutoTextProductId,
      purpose: "stitchr",
    })
      .then((text) => {
        const baseOverlay =
          previewTextOverlays[0] ?? createDefaultTextOverlay(totalDuration, 0);
        const nextTextOverlays = clampTextOverlays(
          [
            {
              ...baseOverlay,
              text: text.overlayText || text.hook,
            },
            ...previewTextOverlays.slice(1),
          ],
          totalDuration,
        );

        if (mode === "longr") {
          setLongrTextOverlays(nextTextOverlays);
          setAutoTextMessage("Text generated.");
          return;
        }

        if (!activeUgcMetadata) {
          return;
        }

        if (
          reusedTextOverlays !== null &&
          !Object.prototype.hasOwnProperty.call(
            textOverlaysByUgcId,
            activeUgcMetadata.id,
          )
        ) {
          setReusedTextOverlays(nextTextOverlays);
          setAutoTextMessage("Text generated.");
          return;
        }

        setTextOverlaysByUgcId((overlays) => ({
          ...overlays,
          [activeUgcMetadata.id]: nextTextOverlays,
        }));
        setAutoTextMessage("Text generated.");
      })
      .catch((error) => {
        setAutoTextMessage(
          error instanceof Error ? error.message : "Unable to generate text.",
        );
      })
      .finally(() => setIsGeneratingAutoText(false));
  }, [
    activeAutoTextProductId,
    activeUgcMetadata,
    mode,
    previewTextOverlays,
    reusedTextOverlays,
    textOverlaysByUgcId,
    totalDuration,
  ]);

  const handleActiveUgcChange = useCallback((id: string) => {
    setActivePreviewUgcId(id);
  }, []);
  const handleTemplateChange = useCallback((templateId: string) => {
    setSelectedTemplateId(templateId);
    setAppliedTemplateId("");
  }, []);
  const handleDemoProductFilterChange = useCallback((productId: string) => {
    setDemoProductFilterId(productId);
    setSelectedDemoId(undefined);
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
  const hasStitchrInputs = ugcClips.length > 0 && demoClips.length > 0;

  return (
    <StitchrShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <StitchrHeader />
        <StitchTemplatePicker
          isLoading={stitchTemplates.isLoading}
          selectedTemplateId={selectedTemplateId}
          templates={stitchTemplates.templates}
          onTemplateChange={handleTemplateChange}
        />
        {library.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {library.error}
          </div>
        ) : null}
        {hasStitchrInputs ? (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
            <div className="flex min-w-0 flex-col gap-5">
              <ClipPickerPanel
                addMusic={addMusic}
                mode={mode}
                demoPlaybackRate={demoPlaybackRate}
                includeDemoAudio={includeDemoAudio}
                includeUgcAudio={includeUgcAudio}
                hasMoreClips={hasMoreStitchrClips}
                isLoadingMoreClips={isLoadingMoreStitchrClips}
                selectedMusicTrack={selectedMusicTrack}
                products={products.products}
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
                canStitch={canStitch}
                isStitching={isStitching}
                onAddMusicChange={(checked) => {
                  setAddMusic(checked);

                  if (checked) {
                    setSelectedMusicTrack(null);
                  }
                }}
                onDemoPlaybackRateChange={setDemoPlaybackRate}
                onIncludeDemoAudioChange={setIncludeDemoAudio}
                onIncludeUgcAudioChange={setIncludeUgcAudio}
                onLoadMoreClips={handleLoadMoreStitchrClips}
                onSelectMusicTrack={(track) => {
                  setSelectedMusicTrack(track);
                  setAddMusic(false);
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
                products={products.products}
                selectedProductId={activeAutoTextProductId}
                isGenerating={isGeneratingAutoText}
                message={autoTextMessage}
                onProductChange={setSelectedAutoTextProductId}
                onGenerate={handleGenerateAutoText}
              />
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
            <div className="min-w-0 w-full max-w-[340px] justify-self-center xl:sticky xl:top-5 xl:justify-self-end">
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
            </div>
          </div>
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
