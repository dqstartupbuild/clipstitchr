import type { HookLabPostAnalysis } from "@/lib/clipstitchr/types/HookLabPostAnalysis";
import { getHookLabTimelineCoversVideo } from "./getHookLabTimelineCoversVideo";

function readString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : fallback;
}

function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 12)
    : [];
}

function readScore(value: unknown) {
  const score = typeof value === "number" ? value : Number(value);

  return Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0;
}

export function parseHookLabPostAnalysis(
  outputText: string,
  durationSeconds: number,
): HookLabPostAnalysis {
  const jsonStart = outputText.indexOf("{");
  const jsonEnd = outputText.lastIndexOf("}");

  if (jsonStart < 0 || jsonEnd <= jsonStart) {
    throw new Error("Hook Lab analysis did not return a report.");
  }

  let parsed: Record<string, unknown>;

  try {
    parsed = JSON.parse(outputText.slice(jsonStart, jsonEnd + 1)) as Record<
      string,
      unknown
    >;
  } catch {
    throw new Error("Hook Lab analysis returned an unreadable report.");
  }

  const rawTimeline = Array.isArray(parsed.timeline) ? parsed.timeline : [];
  const timeline = rawTimeline
    .flatMap((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return [];
      }

      const value = entry as Record<string, unknown>;
      const rawStart = Number(value.startSeconds);
      const rawEnd = Number(value.endSeconds);
      const startSeconds = Number.isFinite(rawStart)
        ? Math.max(0, Math.min(durationSeconds, rawStart))
        : 0;
      const endSeconds = Number.isFinite(rawEnd)
        ? Math.max(startSeconds, Math.min(durationSeconds, rawEnd))
        : startSeconds;
      const visual = readString(value.visual, "");

      if (!visual || endSeconds <= startSeconds) {
        return [];
      }

      const onScreenText = readString(value.onScreenText, "");
      const audio = readString(value.audio, "");

      return [
        {
          ...(audio ? { audio } : {}),
          endSeconds,
          ...(onScreenText ? { onScreenText } : {}),
          startSeconds,
          visual,
        },
      ];
    })
    .sort((left, right) => left.startSeconds - right.startSeconds)
    .slice(0, 80);

  if (!timeline.length) {
    throw new Error("Hook Lab analysis did not include a video timeline.");
  }

  if (!getHookLabTimelineCoversVideo(timeline, durationSeconds)) {
    throw new Error(
      "Hook Lab analysis did not cover the full video from start to finish.",
    );
  }

  const rawPerformance =
    parsed.performance &&
    typeof parsed.performance === "object" &&
    !Array.isArray(parsed.performance)
      ? (parsed.performance as Record<string, unknown>)
      : {};

  return {
    callToAction: readString(parsed.callToAction, "None identified."),
    contentSummary: readString(
      parsed.contentSummary,
      "No summary was returned.",
    ),
    format: readString(parsed.format, "Format not identified."),
    openingHook: readString(
      parsed.openingHook,
      "Opening hook not identified.",
    ),
    performance: {
      confidence: readString(
        rawPerformance.confidence,
        "The video is observable, but platform analytics are limited.",
      ),
      engagementExplanation: readString(
        rawPerformance.engagementExplanation,
        "There was not enough platform data to explain engagement.",
      ),
      hookScore: readScore(rawPerformance.hookScore),
      limitations: readStringArray(rawPerformance.limitations),
      overallScore: readScore(rawPerformance.overallScore),
      pacingScore: readScore(rawPerformance.pacingScore),
      platformFitScore: readScore(rawPerformance.platformFitScore),
      retentionExplanation: readString(
        rawPerformance.retentionExplanation,
        "Retention can only be inferred without watch-time data.",
      ),
      strengths: readStringArray(rawPerformance.strengths),
    },
    timeline,
    transferableLessons: readStringArray(parsed.transferableLessons),
  };
}
