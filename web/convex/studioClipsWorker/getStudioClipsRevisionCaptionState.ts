import type { StudioClipsImmutableSourceOutput } from "../../lib/clipstitchr/types/studioClips/StudioClipsImmutableSourceOutput";
import type { StudioClipsRenderOperation } from "../../lib/clipstitchr/types/studioClips/StudioClipsRenderOperation";
import { trimStudioClipsCaptionCues } from "./trimStudioClipsCaptionCues";
import { mergeStudioClipsCaptionCues } from "./mergeStudioClipsCaptionCues";

export function getStudioClipsRevisionCaptionState(input: {
  operation: StudioClipsRenderOperation;
  outputIndex: number;
  source: StudioClipsImmutableSourceOutput;
  sources: StudioClipsImmutableSourceOutput[];
}) {
  const operation = input.operation;
  if (operation.kind === "trim") {
    return {
      captionsBurned: Boolean(input.source.captionsBurned),
      cues: trimStudioClipsCaptionCues(
        input.source.captionCues ?? [],
        operation.startSeconds,
        operation.endSeconds,
      ),
    };
  }
  if (operation.kind === "split") {
    const boundaries = [
      0,
      ...operation.pointsSeconds,
      input.source.durationSeconds,
    ];
    return {
      captionsBurned: Boolean(input.source.captionsBurned),
      cues: trimStudioClipsCaptionCues(
        input.source.captionCues ?? [],
        boundaries[input.outputIndex] ?? 0,
        boundaries[input.outputIndex + 1] ?? input.source.durationSeconds,
      ),
    };
  }
  if (operation.kind === "merge") {
    let captionsBurned = false;
    for (const source of input.sources) {
      if (source.captionsBurned) captionsBurned = true;
    }
    return {
      captionsBurned,
      cues: mergeStudioClipsCaptionCues(input.sources),
    };
  }
  if (operation.kind === "captions") {
    return {
      captionsBurned: operation.enabled && operation.burnIn,
      cues: input.source.captionCues ?? [],
    };
  }
  if (operation.kind === "project_style") {
    return { captionsBurned: true, cues: input.source.captionCues ?? [] };
  }
  return {
    captionsBurned: Boolean(input.source.captionsBurned),
    cues: input.source.captionCues ?? [],
  };
}
