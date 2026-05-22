import { SWIPR_BACKGROUND_GENERATION_METADATA_HEADER_NAME } from "@/lib/clipstitchr/constants/swiprBackgroundGenerationMetadataHeaderName";
import type { SwiprBackgroundPresetId } from "@/lib/clipstitchr/types/SwiprBackgroundPresetId";

type GenerateSwiprBackgroundWithAiOptions = {
  productContext: string;
  prompt?: string;
  presetId?: SwiprBackgroundPresetId;
};

export async function generateSwiprBackgroundWithAi({
  productContext,
  prompt,
  presetId,
}: GenerateSwiprBackgroundWithAiOptions) {
  const response = await fetch("/api/swipr/backgrounds/generate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      productContext,
      ...(prompt?.trim() ? { prompt } : {}),
      ...(presetId ? { presetId } : {}),
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(body?.message ?? "Unable to generate this background.");
  }

  const generationDetailsHeader = response.headers.get(
    SWIPR_BACKGROUND_GENERATION_METADATA_HEADER_NAME,
  );

  return {
    blob: await response.blob(),
    generationDetails: generationDetailsHeader
      ? decodeURIComponent(generationDetailsHeader)
      : undefined,
  };
}
