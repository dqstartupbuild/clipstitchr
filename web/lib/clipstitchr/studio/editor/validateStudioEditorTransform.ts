import type { StudioEditorValidationContext } from "../../types/studioEditor/StudioEditorValidationContext";
import { addStudioEditorUnexpectedKeyIssues } from "./addStudioEditorUnexpectedKeyIssues";
import { isStudioEditorRecord } from "./isStudioEditorRecord";

export function validateStudioEditorTransform(
  value: unknown,
  path: string,
  context: StudioEditorValidationContext,
) {
  if (!isStudioEditorRecord(value)) {
    context.add(
      `${path}.transform`,
      "invalid_transform",
      "Expected transform settings.",
    );
    return;
  }
  addStudioEditorUnexpectedKeyIssues(
    value,
    `${path}.transform`,
    [
      "positionX",
      "positionY",
      "scaleX",
      "scaleY",
      "rotationDegrees",
      "opacity",
    ],
    context.add,
  );
  context.boundedNumber(
    value.positionX,
    `${path}.transform.positionX`,
    -32_768,
    32_768,
  );
  context.boundedNumber(
    value.positionY,
    `${path}.transform.positionY`,
    -32_768,
    32_768,
  );
  context.boundedNumber(value.scaleX, `${path}.transform.scaleX`, 0.01, 100);
  context.boundedNumber(value.scaleY, `${path}.transform.scaleY`, 0.01, 100);
  context.boundedNumber(
    value.rotationDegrees,
    `${path}.transform.rotationDegrees`,
    -360_000,
    360_000,
  );
  context.boundedNumber(value.opacity, `${path}.transform.opacity`, 0, 1);
}
