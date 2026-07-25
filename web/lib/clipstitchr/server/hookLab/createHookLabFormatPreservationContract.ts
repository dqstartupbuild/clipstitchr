import type { HookLabPostAnalysis } from "@/lib/clipstitchr/types/HookLabPostAnalysis";

export function createHookLabFormatPreservationContract({
  analysis,
  sourceText,
}: {
  analysis: HookLabPostAnalysis;
  sourceText?: string;
}) {
  const formatDna = analysis.formatDna;
  const approximateRuntimeSeconds = Math.max(
    0,
    ...analysis.timeline.map((entry) => entry.endSeconds),
  );

  return {
    approximateRuntimeSeconds,
    beatCount: analysis.timeline.length,
    callToActionStyle: formatDna?.ctaStyle ?? analysis.callToAction,
    editRhythm: formatDna?.editRhythm ?? analysis.format,
    firstPayoff: formatDna?.firstPayoff,
    firstPayoffAtSeconds: formatDna?.firstPayoffAtSeconds,
    hookPattern: formatDna?.hookPattern ?? analysis.openingHook,
    openingHook: analysis.openingHook,
    openingVisual:
      formatDna?.openingVisual ?? analysis.timeline[0]?.visual ?? "",
    originalOnScreenText: analysis.onScreenText ?? [],
    proofDevice: formatDna?.proofDevice,
    recreationEssentials: analysis.recreationEssentials ?? [],
    replicationFormula: formatDna?.replicationFormula,
    retentionDevice: formatDna?.retentionDevice,
    signatureDevice: formatDna?.signatureDevice,
    sourceCaption: sourceText ?? analysis.caption ?? "",
    storyBeats: formatDna?.storyBeats ?? [],
    storyFramework: formatDna?.storyFramework,
  };
}
