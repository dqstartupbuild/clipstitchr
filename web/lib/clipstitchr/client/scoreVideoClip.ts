"use client";

import type { ClipPerformanceScore } from "@/lib/clipstitchr/types/ClipPerformanceScore";
import { parseClipPerformanceScore } from "@/lib/clipstitchr/utils/parseClipPerformanceScore";

export async function scoreVideoClip(
  clipId: string,
): Promise<ClipPerformanceScore> {
  const response = await fetch("/api/video-clips/score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ clipId }),
  });
  const body = (await response.json()) as {
    message?: string;
    performanceScore?: unknown;
  };

  if (!response.ok) {
    throw new Error(body.message ?? "Unable to score this clip.");
  }

  const performanceScore = parseClipPerformanceScore(body.performanceScore);

  if (!performanceScore) {
    throw new Error("The clip score came back empty.");
  }

  return performanceScore;
}
