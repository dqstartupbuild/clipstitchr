import type { StudioEditorValidationContext } from "../../types/studioEditor/StudioEditorValidationContext";
import { addStudioEditorUnexpectedKeyIssues } from "./addStudioEditorUnexpectedKeyIssues";
import { isStudioEditorFrameAligned } from "./isStudioEditorFrameAligned";
import { isStudioEditorRecord } from "./isStudioEditorRecord";
import { validateStudioEditorTextStyle } from "./validateStudioEditorTextStyle";

export function validateStudioEditorCaptionLayer(
  layer: Record<string, unknown>,
  path: string,
  fps: number,
  context: StudioEditorValidationContext,
) {
  if (!isStudioEditorRecord(layer.style)) {
    context.add(
      `${path}.style`,
      "invalid_caption_style",
      "Expected caption style settings.",
    );
  } else {
    addStudioEditorUnexpectedKeyIssues(
      layer.style,
      `${path}.style`,
      [
        "text",
        "activeColor",
        "maxWidthRatio",
        "positionYRatio",
        "wordsPerPage",
      ],
      context.add,
    );
    validateStudioEditorTextStyle(
      layer.style.text,
      `${path}.style.text`,
      context,
    );
    context.boundedString(
      layer.style.activeColor,
      `${path}.style.activeColor`,
      64,
    );
    context.boundedNumber(
      layer.style.maxWidthRatio,
      `${path}.style.maxWidthRatio`,
      0.1,
      1,
    );
    context.boundedNumber(
      layer.style.positionYRatio,
      `${path}.style.positionYRatio`,
      0,
      1,
    );
    if (
      context.boundedNumber(
        layer.style.wordsPerPage,
        `${path}.style.wordsPerPage`,
        1,
        30,
      ) &&
      !Number.isInteger(layer.style.wordsPerPage)
    ) {
      context.add(
        `${path}.style.wordsPerPage`,
        "invalid_integer",
        "Words per page must be a whole number.",
      );
    }
  }
  if (!Array.isArray(layer.cues) || layer.cues.length > 5_000) {
    context.add(
      `${path}.cues`,
      "invalid_cues",
      "Expected no more than 5,000 caption cues.",
    );
    return;
  }
  const cueIds = new Set<string>();
  let previousEnd = 0;
  for (const [index, cue] of layer.cues.entries()) {
    const cuePath = `${path}.cues[${index}]`;
    if (!isStudioEditorRecord(cue)) {
      context.add(cuePath, "invalid_cue", "Expected a caption cue object.");
      continue;
    }
    addStudioEditorUnexpectedKeyIssues(
      cue,
      cuePath,
      ["id", "startSeconds", "endSeconds", "text"],
      context.add,
    );
    if (context.boundedString(cue.id, `${cuePath}.id`, 120)) {
      if (cueIds.has(cue.id)) {
        context.add(
          `${cuePath}.id`,
          "duplicate_cue_id",
          "Caption cue IDs must be unique per layer.",
        );
      }
      cueIds.add(cue.id);
    }
    context.boundedString(cue.text, `${cuePath}.text`, 2_000);
    const maximum = Number(layer.durationSeconds) || 86_400;
    const startValid = context.boundedNumber(
      cue.startSeconds,
      `${cuePath}.startSeconds`,
      0,
      maximum,
    );
    const endValid = context.boundedNumber(
      cue.endSeconds,
      `${cuePath}.endSeconds`,
      0,
      maximum,
    );
    if (!startValid || !endValid) continue;
    if ((cue.endSeconds as number) <= (cue.startSeconds as number)) {
      context.add(
        cuePath,
        "invalid_cue_range",
        "Caption cue end must follow its start.",
      );
    }
    if ((cue.startSeconds as number) < previousEnd - 1e-7) {
      context.add(
        cuePath,
        "overlapping_cues",
        "Caption cues must be ordered and non-overlapping.",
      );
    }
    if (
      fps > 0 &&
      (!isStudioEditorFrameAligned(cue.startSeconds as number, fps) ||
        !isStudioEditorFrameAligned(cue.endSeconds as number, fps))
    ) {
      context.add(
        cuePath,
        "not_frame_aligned",
        "Caption cue times must align to project frames.",
      );
    }
    previousEnd = cue.endSeconds as number;
  }
}
