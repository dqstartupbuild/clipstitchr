import type { SwiprBackgroundPresetId } from "@/lib/clipstitchr/types/SwiprBackgroundPresetId";

type GenerateSwiprBackgroundWithAiOptions = {
  productContext: string;
  presetId: SwiprBackgroundPresetId;
};

export async function generateSwiprBackgroundWithAi({
  productContext,
  presetId,
}: GenerateSwiprBackgroundWithAiOptions) {
  const response = await fetch("/api/swipr/backgrounds/generate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      productContext,
      presetId,
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(body?.message ?? "Unable to generate this background.");
  }

  return response.blob();
}
