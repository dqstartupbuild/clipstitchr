import type { StudioClipsAnalysis } from "../../lib/clipstitchr/types/studioClips/StudioClipsAnalysis";
import { assertStudioClipsBoundedText } from "../studioClipsTasks/assertStudioClipsBoundedText";
import { assertStudioClipsIdentifier } from "../studioClipsTasks/assertStudioClipsIdentifier";
import { normalizeStudioClipsScore } from "./normalizeStudioClipsScore";
import { normalizeStudioClipsTimestamp } from "./normalizeStudioClipsTimestamp";

export function normalizeStudioClipsAnalysis(
  value: StudioClipsAnalysis,
): StudioClipsAnalysis {
  if (value.schemaVersion !== "studio-clips-analysis-v1") {
    throw new Error("Studio Clips analysis schema version is unsupported.");
  }
  if (value.transcriptExcerpts.length > 200 || value.candidates.length > 100) {
    throw new Error("Studio Clips analysis contains too many entries.");
  }
  const transcriptExcerpts = value.transcriptExcerpts.map((excerpt) => {
    const startSeconds = normalizeStudioClipsTimestamp(
      excerpt.startSeconds,
      "Transcript start time",
    );
    const endSeconds = normalizeStudioClipsTimestamp(
      excerpt.endSeconds,
      "Transcript end time",
    );
    if (endSeconds <= startSeconds) throw new Error("Transcript range is invalid.");
    return {
      endSeconds,
      startSeconds,
      text: assertStudioClipsBoundedText(excerpt.text, {
        label: "Transcript excerpt",
        maxLength: 2_000,
      }),
    };
  });
  const candidates = value.candidates.map((candidate) => {
    const startSeconds = normalizeStudioClipsTimestamp(
      candidate.startSeconds,
      "Candidate start time",
    );
    const endSeconds = normalizeStudioClipsTimestamp(
      candidate.endSeconds,
      "Candidate end time",
    );
    if (endSeconds <= startSeconds) throw new Error("Candidate range is invalid.");
    if (candidate.reasoning.length === 0 || candidate.reasoning.length > 20) {
      throw new Error("Candidate reasoning is invalid.");
    }
    const score = {
      overall: normalizeStudioClipsScore(candidate.score.overall, "Overall score")!,
      ...(normalizeStudioClipsScore(candidate.score.hook, "Hook score") !== undefined
        ? { hook: candidate.score.hook }
        : {}),
      ...(normalizeStudioClipsScore(candidate.score.retention, "Retention score") !== undefined
        ? { retention: candidate.score.retention }
        : {}),
      ...(normalizeStudioClipsScore(candidate.score.clarity, "Clarity score") !== undefined
        ? { clarity: candidate.score.clarity }
        : {}),
      ...(normalizeStudioClipsScore(candidate.score.shareability, "Shareability score") !==
      undefined
        ? { shareability: candidate.score.shareability }
        : {}),
    };
    return {
      endSeconds,
      id: assertStudioClipsIdentifier(candidate.id, "Analysis candidate ID"),
      ...(candidate.outputId
        ? {
            outputId: assertStudioClipsIdentifier(
              candidate.outputId,
              "Studio Clips output ID",
            ),
          }
        : {}),
      reasoning: candidate.reasoning.map((reason) =>
        assertStudioClipsBoundedText(reason, {
          label: "Candidate reasoning",
          maxLength: 1_000,
        }),
      ),
      score,
      startSeconds,
      ...(candidate.title
        ? {
            title: assertStudioClipsBoundedText(candidate.title, {
              label: "Candidate title",
              maxLength: 200,
            }),
          }
        : {}),
    };
  });
  return {
    candidates,
    schemaVersion: "studio-clips-analysis-v1",
    ...(value.summary
      ? {
          summary: assertStudioClipsBoundedText(value.summary, {
            label: "Analysis summary",
            maxLength: 4_000,
          }),
        }
      : {}),
    transcriptExcerpts,
  };
}
