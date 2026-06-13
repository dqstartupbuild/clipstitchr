import { createCliprDemoVisualPrompt } from "@/lib/clipstitchr/server/createCliprDemoVisualPrompt";
import { getCliprReplicateDuration } from "@/lib/clipstitchr/server/getCliprReplicateDuration";
import { cliprDemoVideoModelId } from "@/lib/clipstitchr/constants/cliprDemoVideoModelId";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type CreateCliprDemoVideoInputOptions = {
  demoClipName: string;
  demoVideoDescription?: string;
  durationSeconds: number;
  product: ProductProfile;
  referenceVideoUrl: string;
};

export function createCliprDemoVideoInput({
  demoClipName,
  demoVideoDescription,
  durationSeconds,
  product,
  referenceVideoUrl,
}: CreateCliprDemoVideoInputOptions) {
  return {
    prompt: createCliprDemoVisualPrompt({
      demoClipName,
      demoVideoDescription,
      product,
    }),
    reference_videos: [referenceVideoUrl],
    duration: getCliprReplicateDuration({
      durationSeconds,
      modelId: cliprDemoVideoModelId,
    }),
    resolution: "720p",
    aspect_ratio: "9:16",
    generate_audio: false,
  };
}
