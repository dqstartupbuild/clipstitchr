"use client";

import type { ClipType } from "@/lib/clipstitchr/types/ClipType";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import type { UploadNormalizationLayout } from "@/lib/clipstitchr/types/UploadNormalizationLayout";

type CreateUploadVideoJobOptions = {
  clipId: string;
  clipType: ClipType;
  layout?: UploadNormalizationLayout;
  originalName: string;
  productId?: string;
  sourceVideoObject: R2ObjectReference;
};

export async function createUploadVideoJob({
  clipId,
  clipType,
  layout,
  originalName,
  productId,
  sourceVideoObject,
}: CreateUploadVideoJobOptions) {
  const response = await fetch("/api/uploads/jobs", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      clipId,
      clipType,
      layout,
      originalName,
      productId,
      sourceVideoObject,
    }),
  });
  const body = (await response.json()) as {
    job?: { id: string; status: string };
    message?: string;
  };

  if (!response.ok) {
    throw new Error(body.message ?? "Unable to queue this upload.");
  }

  return body.job;
}
