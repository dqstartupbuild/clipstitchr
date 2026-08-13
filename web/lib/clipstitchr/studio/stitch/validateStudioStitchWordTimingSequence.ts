import type { StudioStitchValidationIssue } from "../../types/studioStitch/StudioStitchValidationIssue";
import { addStudioStitchUnexpectedKeyIssues } from "./addStudioStitchUnexpectedKeyIssues";
import { isStudioStitchRecord } from "./isStudioStitchRecord";

export function validateStudioStitchWordTimingSequence(
  value: unknown,
  path: string,
  maximumEndSeconds: number | null,
): StudioStitchValidationIssue[] {
  const issues: StudioStitchValidationIssue[] = [];
  if (!Array.isArray(value) || value.length > 1_000) {
    return [
      {
        path,
        code: "invalid_word_timings",
        message: "Expected no more than 1,000 ordered word timings.",
      },
    ];
  }
  let previousEnd = 0;
  value.forEach((timing, index) => {
    const timingPath = `${path}[${index}]`;
    if (!isStudioStitchRecord(timing)) {
      issues.push({
        path: timingPath,
        code: "invalid_word_timing",
        message: "Expected a word timing object.",
      });
      return;
    }
    addStudioStitchUnexpectedKeyIssues(
      timing,
      timingPath,
      ["word", "startSeconds", "endSeconds"],
      issues,
    );
    const start = timing.startSeconds;
    const end = timing.endSeconds;
    if (
      typeof timing.word !== "string" ||
      timing.word.trim().length === 0 ||
      timing.word.length > 100
    ) {
      issues.push({
        path: `${timingPath}.word`,
        code: "invalid_string",
        message: "Expected a non-empty word up to 100 characters.",
      });
    }
    if (
      typeof start !== "number" ||
      !Number.isFinite(start) ||
      typeof end !== "number" ||
      !Number.isFinite(end) ||
      start < previousEnd - 1e-6 ||
      end <= start ||
      (maximumEndSeconds !== null && end > maximumEndSeconds + 1e-6)
    ) {
      issues.push({
        path: timingPath,
        code: "invalid_word_timing",
        message: "Word timings must be ordered and inside their audio duration.",
      });
    }
    if (typeof end === "number" && Number.isFinite(end)) {
      previousEnd = end;
    }
  });
  return issues;
}
