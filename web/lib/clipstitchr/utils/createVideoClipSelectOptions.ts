import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

type VideoClipSelectOption = {
  label: string;
  value: string;
};

type VideoClipSelectFallback = {
  id: string;
  name: string;
};

export function createVideoClipSelectOptions(
  clips: VideoClipMetadata[],
  fallbackClip?: VideoClipSelectFallback | null,
): VideoClipSelectOption[] {
  const seenIds = new Set<string>();
  const options: VideoClipSelectOption[] = [];

  if (fallbackClip) {
    seenIds.add(fallbackClip.id);
    options.push({
      label: fallbackClip.name,
      value: fallbackClip.id,
    });
  }

  for (const clip of clips) {
    if (seenIds.has(clip.id)) {
      continue;
    }

    seenIds.add(clip.id);
    options.push({
      label: clip.name,
      value: clip.id,
    });
  }

  return options;
}
