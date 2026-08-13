import type { Dispatch, SetStateAction } from "react";

export function openStudioStitchRun(
  id: string,
  setLookupId: Dispatch<SetStateAction<string>>,
  onRememberRun: (id: string) => void,
  onSelectRun: (id: string) => void,
) {
  const normalized = id.trim();
  if (!normalized) {
    return;
  }

  setLookupId(normalized);
  onRememberRun(normalized);
  onSelectRun(normalized);
}
