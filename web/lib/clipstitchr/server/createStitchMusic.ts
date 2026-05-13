import type { Prediction } from "replicate";
import { cliprMusicGenerationDefaults } from "@/lib/clipstitchr/constants/cliprMusicGenerationDefaults";
import { createCliprMusicInput } from "@/lib/clipstitchr/server/createCliprMusicInput";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createStitchMusicPrompt } from "@/lib/clipstitchr/server/createStitchMusicPrompt";
import { fetchReplicateOutput } from "@/lib/clipstitchr/server/fetchReplicateOutput";
import { getCliprMusicModelId } from "@/lib/clipstitchr/server/getCliprMusicModelId";
import { getReplicateOutputUrl } from "@/lib/clipstitchr/server/getReplicateOutputUrl";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

type CreateStitchMusicOptions = {
  replicate: ReplicateClient;
  stitch: Pick<
    Stitch,
    "demoClipName" | "textOverlay" | "ugcClipName"
  >;
};

export async function createStitchMusic({
  replicate,
  stitch,
}: CreateStitchMusicOptions) {
  const modelId = getCliprMusicModelId();
  const prompt = createStitchMusicPrompt({
    demoClipName: stitch.demoClipName,
    textOverlay: stitch.textOverlay,
    ugcClipName: stitch.ugcClipName,
  });
  const prediction = await replicate.predictions.create({
    model: modelId,
    input: createCliprMusicInput({ prompt }),
  });
  const completedPrediction = await replicate.wait(prediction, {
    interval: 5000,
  });

  if (completedPrediction.status !== "succeeded") {
    throw new Error(
      typeof completedPrediction.error === "string"
        ? completedPrediction.error
        : "Replicate did not complete stitch music generation.",
    );
  }

  const outputUrl = getReplicateOutputUrl(
    (completedPrediction as Prediction).output,
  );
  const outputResponse = await fetchReplicateOutput(outputUrl);
  const outputContentType = outputResponse.headers.get("content-type");
  const contentType =
    outputContentType && outputContentType !== "application/octet-stream"
      ? outputContentType
      : "audio/mpeg";
  const body = await outputResponse.arrayBuffer();

  return {
    body,
    contentType,
    durationSeconds: cliprMusicGenerationDefaults.durationSeconds,
    modelId,
    predictionId: completedPrediction.id,
    prompt,
  };
}
