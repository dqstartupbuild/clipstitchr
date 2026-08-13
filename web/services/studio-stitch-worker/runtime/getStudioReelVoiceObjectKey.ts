export function getStudioReelVoiceObjectKey(input: {
  ownerId: string;
  productId: string;
  recipeId: string;
  runAttempt: number;
  runId: string;
}) {
  return [
    `users/${encodeURIComponent(input.ownerId)}/studio/v1/media-output`,
    encodeURIComponent(input.productId),
    encodeURIComponent(input.runId),
    encodeURIComponent(input.recipeId),
    "_checkpoints",
    `attempt-${input.runAttempt}`,
    "voice.m4a",
  ].join("/");
}
