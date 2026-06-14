"use client";

import type { StitchScore } from "@/lib/clipstitchr/types/StitchScore";
import { parseStitchScore } from "@/lib/clipstitchr/utils/parseStitchScore";

export async function scoreStitch(stitchId: string): Promise<StitchScore> {
  const response = await fetch("/api/stitches/score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ stitchId }),
  });
  const body = (await response.json()) as {
    message?: string;
    stitchScore?: unknown;
  };

  if (!response.ok) {
    throw new Error(body.message ?? "Unable to score this stitch.");
  }

  const stitchScore = parseStitchScore(body.stitchScore);

  if (!stitchScore) {
    throw new Error("The stitch score came back empty.");
  }

  return stitchScore;
}
