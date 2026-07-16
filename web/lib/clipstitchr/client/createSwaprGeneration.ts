"use client";

import type { SwaprCharacterOrientation } from "@/lib/clipstitchr/types/SwaprCharacterOrientation";
import type { SwaprMode } from "@/lib/clipstitchr/types/SwaprMode";
import type { SwaprReferenceVideoSegment } from "@/lib/clipstitchr/types/SwaprReferenceVideoSegment";

type CreateSwaprGenerationOptions = {
  batchId: string;
  characterOrientation: SwaprCharacterOrientation;
  clipId: string;
  clipName: string;
  keepOriginalSound: boolean;
  mode: SwaprMode;
  photoId: string;
  productId?: string;
  prompt: string;
  referenceClipId: string;
  referenceClipName: string;
  segments: SwaprReferenceVideoSegment[];
  totalEstimatedDurationSeconds: number;
};

export async function createSwaprGeneration(
  options: CreateSwaprGenerationOptions,
) {
  const response = await fetch("/api/swapr/generations", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(options),
  });
  const body = (await response.json()) as {
    job?: { id: string; status: string };
    message?: string;
  };

  if (!response.ok) {
    throw new Error(body.message ?? "Unable to queue Swapr generation.");
  }

  return body.job;
}
