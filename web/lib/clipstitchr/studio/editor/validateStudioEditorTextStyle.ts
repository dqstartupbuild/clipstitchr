import type { StudioEditorValidationContext } from "../../types/studioEditor/StudioEditorValidationContext";
import { addStudioEditorUnexpectedKeyIssues } from "./addStudioEditorUnexpectedKeyIssues";
import { isStudioEditorRecord } from "./isStudioEditorRecord";

export function validateStudioEditorTextStyle(
  value: unknown,
  path: string,
  context: StudioEditorValidationContext,
) {
  if (!isStudioEditorRecord(value)) {
    context.add(path, "invalid_text_style", "Expected text style settings.");
    return;
  }
  addStudioEditorUnexpectedKeyIssues(
    value,
    path,
    [
      "fontFamily",
      "fontSizePixels",
      "fontWeight",
      "lineHeight",
      "letterSpacingPixels",
      "textAlign",
      "color",
      "backgroundColor",
      "outlineColor",
      "outlineWidthPixels",
    ],
    context.add,
  );
  context.boundedString(value.fontFamily, `${path}.fontFamily`, 200);
  context.boundedNumber(
    value.fontSizePixels,
    `${path}.fontSizePixels`,
    1,
    1_000,
  );
  context.boundedNumber(value.fontWeight, `${path}.fontWeight`, 100, 1_000);
  context.boundedNumber(value.lineHeight, `${path}.lineHeight`, 0.5, 5);
  context.boundedNumber(
    value.letterSpacingPixels,
    `${path}.letterSpacingPixels`,
    -100,
    500,
  );
  if (!["left", "center", "right"].includes(String(value.textAlign))) {
    context.add(
      `${path}.textAlign`,
      "invalid_text_align",
      "Expected left, center, or right.",
    );
  }
  context.boundedString(value.color, `${path}.color`, 64);
  context.boundedString(value.backgroundColor, `${path}.backgroundColor`, 64);
  context.boundedString(value.outlineColor, `${path}.outlineColor`, 64);
  context.boundedNumber(
    value.outlineWidthPixels,
    `${path}.outlineWidthPixels`,
    0,
    100,
  );
}
