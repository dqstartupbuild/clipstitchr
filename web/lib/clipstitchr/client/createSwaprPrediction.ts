import type { SwaprCharacterOrientation } from "@/lib/clipstitchr/types/SwaprCharacterOrientation";
import type { SwaprMode } from "@/lib/clipstitchr/types/SwaprMode";
import type { SwaprReferenceVideoSegment } from "@/lib/clipstitchr/types/SwaprReferenceVideoSegment";
import { readSwaprPredictionResponse } from "@/lib/clipstitchr/utils/readSwaprPredictionResponse";

type CreateSwaprPredictionOptions = {
  batchId: string;
  characterOrientation: SwaprCharacterOrientation;
  keepOriginalSound: boolean;
  mode: SwaprMode;
  photoId: string;
  prompt: string;
  segmentIndex: number;
  segment: SwaprReferenceVideoSegment;
  totalEstimatedDurationSeconds: number;
  totalSegmentCount: number;
};

export async function createSwaprPrediction({
  batchId,
  characterOrientation,
  keepOriginalSound,
  mode,
  photoId,
  prompt,
  segmentIndex,
  segment,
  totalEstimatedDurationSeconds,
  totalSegmentCount,
}: CreateSwaprPredictionOptions) {
  const createResponse = await fetch("/api/swapr/jobs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      batchId,
      photoId,
      videoObject: segment.videoObject,
      estimatedDurationSeconds: segment.duration,
      segmentIndex,
      totalEstimatedDurationSeconds,
      totalSegmentCount,
      prompt,
      mode,
      characterOrientation,
      keepOriginalSound,
    }),
  });

  return await readSwaprPredictionResponse(createResponse);
}
