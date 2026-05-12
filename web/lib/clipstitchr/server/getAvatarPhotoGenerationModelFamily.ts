const MINIMAX_IMAGE_01_MODEL_ID = "minimax/image-01";

export type AvatarPhotoGenerationModelFamily =
  | "openai-gpt-image"
  | "minimax-image-01";

export function getAvatarPhotoGenerationModelFamily(
  modelId: string,
): AvatarPhotoGenerationModelFamily {
  const trimmedModelId = modelId.trim();

  if (
    trimmedModelId === MINIMAX_IMAGE_01_MODEL_ID ||
    trimmedModelId.startsWith(`${MINIMAX_IMAGE_01_MODEL_ID}:`)
  ) {
    return "minimax-image-01";
  }

  return "openai-gpt-image";
}
