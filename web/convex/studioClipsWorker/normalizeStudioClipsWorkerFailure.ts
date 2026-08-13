import type { StudioClipsFailure } from "../../lib/clipstitchr/types/studioClips/StudioClipsFailure";
import { assertStudioClipsBoundedText } from "../studioClipsTasks/assertStudioClipsBoundedText";

export function normalizeStudioClipsWorkerFailure(
  value: StudioClipsFailure,
): StudioClipsFailure {
  return {
    code: assertStudioClipsBoundedText(value.code, {
      label: "Worker failure code",
      maxLength: 120,
    }),
    kind: value.kind,
    message: assertStudioClipsBoundedText(value.message, {
      label: "Worker failure message",
      maxLength: 1_000,
    }),
  };
}
