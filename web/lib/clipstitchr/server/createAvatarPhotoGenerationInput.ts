import { getAvatarPhotoGenerationModelFamily } from "@/lib/clipstitchr/server/getAvatarPhotoGenerationModelFamily";
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
    "minimax-image-01"
  ) {
    return {
      prompt,
      aspect_ratio: "3:4",
      number_of_images: 1,
      prompt_optimizer: false,
      subject_reference: image,
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
