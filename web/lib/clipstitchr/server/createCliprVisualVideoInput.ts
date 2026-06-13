import type { CliprVideoModelId } from "@/lib/clipstitchr/types/CliprVideoModelId";
import { getCliprReplicateDuration } from "@/lib/clipstitchr/server/getCliprReplicateDuration";

const negativePrompt =
  "speech, talking, lip sync, subtitles, captions, text, watermark, logo, blurry, low quality, extra people, scene cut, montage";

type CreateCliprVisualVideoInputOptions = {
  durationSeconds: number;
  imageUrl: string;
  modelId: Exclude<CliprVideoModelId, "auto" | "prunaai/p-video-avatar">;
  prompt: string;
};

export function createCliprVisualVideoInput({
  durationSeconds,
  imageUrl,
  modelId,
  prompt,
}: CreateCliprVisualVideoInputOptions) {
  const duration = getCliprReplicateDuration({ durationSeconds, modelId });

  if (modelId === "kwaivgi/kling-v3-video") {
    return {
      prompt,
      negative_prompt: negativePrompt,
      start_image: imageUrl,
      aspect_ratio: "9:16",
      mode: "pro",
      duration,
      generate_audio: false,
    };
  }

  if (modelId === "google/veo-3.1") {
    return {
      prompt,
      image: imageUrl,
      duration,
      resolution: "720p",
      aspect_ratio: "9:16",
      generate_audio: false,
      negative_prompt: negativePrompt,
    };
  }

  throw new Error("Unsupported Clipr visual video model.");
}
