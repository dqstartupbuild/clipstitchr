import { getAvatarPhotoGenerationModelFamily } from "@/lib/clipstitchr/server/getAvatarPhotoGenerationModelFamily";
import { getAvatarPhotoPrunaOutputQuality } from "@/lib/clipstitchr/server/getAvatarPhotoPrunaOutputQuality";
import type { AvatarImageGenerationQuality } from "@/lib/clipstitchr/types/AvatarImageGenerationQuality";

type CreateAvatarPhotoGenerationInputOptions = {
  image: File;
  modelId: string;
  prompt: string;
  quality: AvatarImageGenerationQuality;
};

export function createAvatarPhotoGenerationInput({
  image,
  modelId,
  prompt,
  quality,
}: CreateAvatarPhotoGenerationInputOptions) {
  if (
    getAvatarPhotoGenerationModelFamily(modelId) ===
    "pruna-z-image-turbo-img2img"
  ) {
    return {
      prompt,
      image,
      strength: 0.6,
      num_inference_steps: 8,
      guidance_scale: 0,
      output_format: "jpg",
      output_quality: getAvatarPhotoPrunaOutputQuality(quality),
    };
  }

  return {
    prompt,
    input_images: [image],
    aspect_ratio: "2:3",
    number_of_images: 1,
    output_format: "jpeg",
    quality,
    background: "opaque",
    moderation: "auto",
  };
}
