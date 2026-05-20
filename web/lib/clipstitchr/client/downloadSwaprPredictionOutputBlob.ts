import type { SwaprPredictionResponse } from "@/lib/clipstitchr/types/SwaprPredictionResponse";
import { getSwaprPredictionOutputUrl } from "@/lib/clipstitchr/utils/getSwaprPredictionOutputUrl";

export async function downloadSwaprPredictionOutputBlob(
  prediction: SwaprPredictionResponse,
) {
  const outputUrl = getSwaprPredictionOutputUrl(prediction.output);

  if (!outputUrl) {
    throw new Error("Replicate completed but did not return a video URL.");
  }

  const outputResponse = await fetch(
    `/api/swapr/output?id=${encodeURIComponent(prediction.id)}&url=${encodeURIComponent(outputUrl)}`,
  );

  if (!outputResponse.ok) {
    throw new Error("Unable to download the generated Swapr output.");
  }

  return await outputResponse.blob();
}
