export function getAvatarPhotoGenerationModelId() {
  return process.env.AVATAR_PHOTO_MODEL_ID || "openai/gpt-image-2";
}
