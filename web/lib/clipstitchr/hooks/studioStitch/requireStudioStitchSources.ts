import type { StudioEditorMediaSourceDescriptor } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceDescriptor";

export function requireStudioStitchSources(
  ids: readonly string[],
  sources: readonly StudioEditorMediaSourceDescriptor[],
  expectedCount: number,
  label: string,
) {
  if (ids.length !== expectedCount) {
    throw new Error(`Choose exactly ${expectedCount} ${label}.`);
  }
  const selected = ids.map((id) =>
    sources.find((source) => source.id === id),
  );
  if (selected.some((source) => !source)) {
    throw new Error(`A selected ${label} is no longer available.`);
  }
  return selected as StudioEditorMediaSourceDescriptor[];
}
