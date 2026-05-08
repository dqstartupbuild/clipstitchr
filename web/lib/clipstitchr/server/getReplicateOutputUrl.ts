import { getSwaprPredictionOutputUrl } from "@/lib/clipstitchr/utils/getSwaprPredictionOutputUrl";

export function getReplicateOutputUrl(output: unknown) {
  const outputUrl = getSwaprPredictionOutputUrl(output);

  if (!outputUrl) {
    throw new Error("Replicate completed but did not return an output URL.");
  }

  return outputUrl;
}
