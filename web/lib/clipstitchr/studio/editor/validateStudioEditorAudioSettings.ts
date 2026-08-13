import type { StudioEditorValidationContext } from "../../types/studioEditor/StudioEditorValidationContext";
import { addStudioEditorUnexpectedKeyIssues } from "./addStudioEditorUnexpectedKeyIssues";
import { isStudioEditorRecord } from "./isStudioEditorRecord";

export function validateStudioEditorAudioSettings(
  value: unknown,
  path: string,
  duration: unknown,
  context: StudioEditorValidationContext,
) {
  if (!isStudioEditorRecord(value)) {
    context.add(`${path}.audio`, "invalid_audio", "Expected audio settings.");
    return;
  }
  addStudioEditorUnexpectedKeyIssues(
    value,
    `${path}.audio`,
    ["volume", "muted", "fadeInSeconds", "fadeOutSeconds"],
    context.add,
  );
  context.boundedNumber(value.volume, `${path}.audio.volume`, 0, 2);
  if (typeof value.muted !== "boolean") {
    context.add(
      `${path}.audio.muted`,
      "invalid_boolean",
      "Expected a boolean.",
    );
  }
  const maximum =
    typeof duration === "number" && Number.isFinite(duration)
      ? duration
      : 86_400;
  const fadeInValid = context.boundedNumber(
    value.fadeInSeconds,
    `${path}.audio.fadeInSeconds`,
    0,
    maximum,
  );
  const fadeOutValid = context.boundedNumber(
    value.fadeOutSeconds,
    `${path}.audio.fadeOutSeconds`,
    0,
    maximum,
  );
  if (
    fadeInValid &&
    fadeOutValid &&
    (value.fadeInSeconds as number) + (value.fadeOutSeconds as number) >
      maximum + 1e-7
  ) {
    context.add(
      `${path}.audio`,
      "overlapping_fades",
      "Audio fades cannot exceed the layer duration together.",
    );
  }
}
