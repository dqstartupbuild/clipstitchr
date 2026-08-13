import type { StudioEditorValidationContext } from "../../types/studioEditor/StudioEditorValidationContext";
import { addStudioEditorUnexpectedKeyIssues } from "./addStudioEditorUnexpectedKeyIssues";
import { isStudioEditorRecord } from "./isStudioEditorRecord";

export function validateStudioEditorCrop(
  value: unknown,
  path: string,
  context: StudioEditorValidationContext,
) {
  if (!isStudioEditorRecord(value)) {
    context.add(`${path}.crop`, "invalid_crop", "Expected crop settings.");
    return;
  }
  addStudioEditorUnexpectedKeyIssues(
    value,
    `${path}.crop`,
    ["top", "right", "bottom", "left"],
    context.add,
  );
  const top = context.boundedNumber(value.top, `${path}.crop.top`, 0, 1);
  const right = context.boundedNumber(value.right, `${path}.crop.right`, 0, 1);
  const bottom = context.boundedNumber(
    value.bottom,
    `${path}.crop.bottom`,
    0,
    1,
  );
  const left = context.boundedNumber(value.left, `${path}.crop.left`, 0, 1);
  if (top && bottom && (value.top as number) + (value.bottom as number) >= 1) {
    context.add(
      `${path}.crop`,
      "empty_crop",
      "Top and bottom crop must leave visible content.",
    );
  }
  if (left && right && (value.left as number) + (value.right as number) >= 1) {
    context.add(
      `${path}.crop`,
      "empty_crop",
      "Left and right crop must leave visible content.",
    );
  }
}
