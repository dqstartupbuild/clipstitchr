import type { StudioEditorValidationContext } from "../../types/studioEditor/StudioEditorValidationContext";
import { addStudioEditorUnexpectedKeyIssues } from "./addStudioEditorUnexpectedKeyIssues";
import { isStudioEditorRecord } from "./isStudioEditorRecord";

const transitionKinds = new Set([
  "none",
  "crossfade",
  "dipToBlack",
  "dipToWhite",
]);

export function validateStudioEditorTransition(
  value: unknown,
  path: string,
  duration: unknown,
  context: StudioEditorValidationContext,
) {
  if (
    !isStudioEditorRecord(value) ||
    typeof value.kind !== "string" ||
    !transitionKinds.has(value.kind)
  ) {
    context.add(
      `${path}.transitionIn`,
      "invalid_transition",
      "Expected a supported transition.",
    );
    return;
  }
  addStudioEditorUnexpectedKeyIssues(
    value,
    `${path}.transitionIn`,
    ["kind", "durationSeconds"],
    context.add,
  );
  const maximum =
    typeof duration === "number" && Number.isFinite(duration)
      ? duration
      : 86_400;
  if (
    !context.boundedNumber(
      value.durationSeconds,
      `${path}.transitionIn.durationSeconds`,
      0,
      maximum,
    )
  ) {
    return;
  }
  if (
    (value.kind === "none" && value.durationSeconds !== 0) ||
    (value.kind !== "none" && value.durationSeconds <= 0)
  ) {
    context.add(
      `${path}.transitionIn`,
      "inconsistent_transition",
      "Transition kind and duration do not agree.",
    );
  }
}
