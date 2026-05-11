const DEFAULT_CLIPR_AVATAR_MODEL_ID = "kwaivgi/kling-avatar-v2";

export function getCliprAvatarModelId() {
  return process.env.CLIPR_AVATAR_MODEL_ID ?? DEFAULT_CLIPR_AVATAR_MODEL_ID;
}
