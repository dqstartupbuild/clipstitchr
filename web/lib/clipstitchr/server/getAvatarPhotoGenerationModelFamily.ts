const PRUNA_Z_IMAGE_TURBO_IMG2IMG_MODEL_ID =
  "prunaai/z-image-turbo-img2img";

export type AvatarPhotoGenerationModelFamily =
  | "openai-gpt-image"
  | "pruna-z-image-turbo-img2img";

export function getAvatarPhotoGenerationModelFamily(
  modelId: string,
): AvatarPhotoGenerationModelFamily {
  const trimmedModelId = modelId.trim();

  if (
    trimmedModelId === PRUNA_Z_IMAGE_TURBO_IMG2IMG_MODEL_ID ||
    trimmedModelId.startsWith(`${PRUNA_Z_IMAGE_TURBO_IMG2IMG_MODEL_ID}:`)
  ) {
    return "pruna-z-image-turbo-img2img";
  }

  return "openai-gpt-image";
}
