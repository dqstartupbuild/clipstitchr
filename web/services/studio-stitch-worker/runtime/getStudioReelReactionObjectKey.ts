export function getStudioReelReactionObjectKey(input: {
  readonly index: number;
  readonly ownerId: string;
  readonly productId: string;
  readonly recipeId: string;
  readonly runAttempt: number;
  readonly runId: string;
  readonly videoId: string;
}) {
  return [
    `users/${encodeURIComponent(input.ownerId)}/studio/v1/media-output`,
    encodeURIComponent(input.productId),
    encodeURIComponent(input.runId),
    encodeURIComponent(input.recipeId),
    "_checkpoints",
    `attempt-${input.runAttempt}`,
    "dansugc",
    `${String(input.index + 1).padStart(3, "0")}-${encodeURIComponent(input.videoId)}.mp4`,
  ].join("/");
}
