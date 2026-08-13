import type { Dispatch, SetStateAction } from "react";

export function toggleStudioClipsMergeOutputSelection(
  outputId: string,
  setSelectedIds: Dispatch<SetStateAction<string[]>>,
) {
  setSelectedIds((current) =>
    current.includes(outputId)
      ? current.filter((id) => id !== outputId)
      : [...current, outputId],
  );
}
